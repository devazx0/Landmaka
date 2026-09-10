import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  OptimizeRouteDto,
  RoutePointDto,
  RouteStopDto,
} from './dto/optimize-route.dto.js';

export interface SequencedStop {
  sequenceIndex: number;
  id: string;
  locationId?: string;
  latitude: number;
  longitude: number;
  label?: string;
  notes?: string;
  distanceFromPreviousMeters: number;
  durationFromPreviousSeconds: number;
  cumulativeDistanceMeters: number;
  cumulativeDurationSeconds: number;
}

export interface RouteOptimizationResult {
  engine: 'osrm' | 'heuristic-2opt';
  origin: RoutePointDto;
  destination?: RoutePointDto;
  roundTrip: boolean;
  totalStops: number;
  totalDistanceMeters: number;
  totalDistanceKm: number;
  totalDurationSeconds: number;
  totalDurationMinutes: number;
  orderedStops: SequencedStop[];
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly osrmBaseUrl =
    process.env.OSRM_BASE_URL || 'http://localhost:5000';

  constructor(private readonly prisma: PrismaService) {}

  async optimizeRoute(
    merchantId: string,
    dto: OptimizeRouteDto,
  ): Promise<RouteOptimizationResult> {
    const { origin, stops, destination, roundTrip = false } = dto;

    const enrichedStops = await this.enrichStopsWithStoredLocations(
      merchantId,
      stops,
    );

    try {
      const osrmResult = await this.tryOsrmTrip(
        origin,
        enrichedStops,
        destination,
        roundTrip,
      );
      if (osrmResult) {
        return osrmResult;
      }
    } catch (err) {
      this.logger.debug(
        `OSRM routing unavailable at ${this.osrmBaseUrl} (${(err as Error).message}). Using embedded 2-Opt TSP heuristic.`,
      );
    }

    return this.solveHeuristic2Opt(
      origin,
      enrichedStops,
      destination,
      roundTrip,
    );
  }

  private async enrichStopsWithStoredLocations(
    merchantId: string,
    stops: RouteStopDto[],
  ): Promise<RouteStopDto[]> {
    const locationIds = stops
      .map((s) => s.locationId)
      .filter((id): id is string => Boolean(id));

    if (locationIds.length === 0) {
      return stops;
    }

    const storedLocations = await this.prisma.location.findMany({
      where: {
        id: { in: locationIds },
        merchantId,
      },
    });

    const locationMap = new Map(storedLocations.map((l) => [l.id, l]));

    return stops.map((stop) => {
      if (stop.locationId && locationMap.has(stop.locationId)) {
        const loc = locationMap.get(stop.locationId)!;
        return {
          ...stop,
          label: stop.label || loc.contactName || loc.landmarkText,
          notes:
            stop.notes ||
            [loc.landmarkText, loc.gateDescription, loc.unitPath]
              .filter(Boolean)
              .join(' | '),
        };
      }
      return stop;
    });
  }

  private async tryOsrmTrip(
    origin: RoutePointDto,
    stops: RouteStopDto[],
    destination?: RoutePointDto,
    roundTrip = false,
  ): Promise<RouteOptimizationResult | null> {
    const points = [origin, ...stops];
    if (destination) {
      points.push(destination);
    }

    const coordString = points
      .map((p) => `${p.longitude},${p.latitude}`)
      .join(';');

    const url = `${this.osrmBaseUrl}/trip/v1/driving/${coordString}?source=first&roundtrip=${roundTrip}&overview=full&geometries=geojson&steps=false`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      code: string;
      trips?: Array<{
        distance: number;
        duration: number;
        geometry: {
          type: 'LineString';
          coordinates: [number, number][];
        };
        legs: Array<{ distance: number; duration: number }>;
      }>;
      waypoints?: Array<{ waypoint_index: number; trips_index: number }>;
    };

    if (data.code !== 'Ok' || !data.trips?.[0] || !data.waypoints) {
      return null;
    }

    const trip = data.trips[0];
    const waypoints = data.waypoints;

    const sortedIndices = waypoints
      .map((wp, order) => ({ order, inputIndex: wp.waypoint_index }))
      .sort((a, b) => a.order - b.order)
      .map((item) => item.inputIndex)
      .filter((idx) => idx > 0 && idx <= stops.length);

    let cumulativeDistance = 0;
    let cumulativeDuration = 0;

    const orderedStops: SequencedStop[] = sortedIndices.map(
      (inputIndex, i) => {
        const originalStop = stops[inputIndex - 1];
        const leg = trip.legs[i] || { distance: 0, duration: 0 };
        cumulativeDistance += leg.distance;
        cumulativeDuration += leg.duration;

        return {
          sequenceIndex: i + 1,
          id: originalStop.id,
          locationId: originalStop.locationId,
          latitude: originalStop.latitude,
          longitude: originalStop.longitude,
          label: originalStop.label,
          notes: originalStop.notes,
          distanceFromPreviousMeters: Math.round(leg.distance),
          durationFromPreviousSeconds: Math.round(leg.duration),
          cumulativeDistanceMeters: Math.round(cumulativeDistance),
          cumulativeDurationSeconds: Math.round(cumulativeDuration),
        };
      },
    );

    return {
      engine: 'osrm',
      origin,
      destination,
      roundTrip,
      totalStops: orderedStops.length,
      totalDistanceMeters: Math.round(trip.distance),
      totalDistanceKm: Number((trip.distance / 1000).toFixed(2)),
      totalDurationSeconds: Math.round(trip.duration),
      totalDurationMinutes: Math.round(trip.duration / 60),
      orderedStops,
      geometry: trip.geometry,
    };
  }

  private solveHeuristic2Opt(
    origin: RoutePointDto,
    stops: RouteStopDto[],
    destination?: RoutePointDto,
    roundTrip = false,
  ): RouteOptimizationResult {
    const numStops = stops.length;

    const unvisited = [...stops];
    let currentPoint: { latitude: number; longitude: number } = origin;
    const tour: RouteStopDto[] = [];

    while (unvisited.length > 0) {
      let bestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const d = this.haversineDistance(currentPoint, unvisited[i]);
        if (d < minDistance) {
          minDistance = d;
          bestIndex = i;
        }
      }

      const nextStop = unvisited.splice(bestIndex, 1)[0];
      tour.push(nextStop);
      currentPoint = nextStop;
    }

    let improved = true;
    let iterations = 0;
    const maxIterations = 50;

    const calcTourDistance = (route: RouteStopDto[]): number => {
      let total = this.haversineDistance(origin, route[0]);
      for (let i = 0; i < route.length - 1; i++) {
        total += this.haversineDistance(route[i], route[i + 1]);
      }
      if (destination) {
        total += this.haversineDistance(route[route.length - 1], destination);
      } else if (roundTrip) {
        total += this.haversineDistance(route[route.length - 1], origin);
      }
      return total;
    };

    let bestDistance = calcTourDistance(tour);

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 0; i < numStops - 1; i++) {
        for (let k = i + 1; k < numStops; k++) {
          const candidate = this.twoOptSwap(tour, i, k);
          const candidateDist = calcTourDistance(candidate);

          if (candidateDist < bestDistance - 1) {
            tour.splice(0, tour.length, ...candidate);
            bestDistance = candidateDist;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }

    const ROAD_FACTOR = 1.35;
    const AVERAGE_SPEED_MPS = 6.11;

    let cumulativeDistance = 0;
    let cumulativeDuration = 0;
    let prevPoint: { latitude: number; longitude: number } = origin;

    const orderedStops: SequencedStop[] = tour.map((stop, index) => {
      const straightLineMeters = this.haversineDistance(prevPoint, stop);
      const roadMeters = Math.round(straightLineMeters * ROAD_FACTOR);
      const legDurationSeconds = Math.round(
        roadMeters / AVERAGE_SPEED_MPS + 180,
      );

      cumulativeDistance += roadMeters;
      cumulativeDuration += legDurationSeconds;
      prevPoint = stop;

      return {
        sequenceIndex: index + 1,
        id: stop.id,
        locationId: stop.locationId,
        latitude: stop.latitude,
        longitude: stop.longitude,
        label: stop.label,
        notes: stop.notes,
        distanceFromPreviousMeters: roadMeters,
        durationFromPreviousSeconds: legDurationSeconds,
        cumulativeDistanceMeters: cumulativeDistance,
        cumulativeDurationSeconds: cumulativeDuration,
      };
    });

    if (destination || roundTrip) {
      const finalTarget = destination || origin;
      const straightLineMeters = this.haversineDistance(prevPoint, finalTarget);
      const roadMeters = Math.round(straightLineMeters * ROAD_FACTOR);
      cumulativeDistance += roadMeters;
      cumulativeDuration += Math.round(roadMeters / AVERAGE_SPEED_MPS);
    }

    const coordinates: [number, number][] = [
      [origin.longitude, origin.latitude],
      ...orderedStops.map(
        (s) => [s.longitude, s.latitude] as [number, number],
      ),
    ];

    if (destination) {
      coordinates.push([destination.longitude, destination.latitude]);
    } else if (roundTrip) {
      coordinates.push([origin.longitude, origin.latitude]);
    }

    return {
      engine: 'heuristic-2opt',
      origin,
      destination,
      roundTrip,
      totalStops: orderedStops.length,
      totalDistanceMeters: cumulativeDistance,
      totalDistanceKm: Number((cumulativeDistance / 1000).toFixed(2)),
      totalDurationSeconds: cumulativeDuration,
      totalDurationMinutes: Math.round(cumulativeDuration / 60),
      orderedStops,
      geometry: {
        type: 'LineString',
        coordinates,
      },
    };
  }

  private twoOptSwap(
    route: RouteStopDto[],
    i: number,
    k: number,
  ): RouteStopDto[] {
    const newRoute = route.slice(0, i);
    const reversedSegment = route.slice(i, k + 1).reverse();
    const remaining = route.slice(k + 1);
    return [...newRoute, ...reversedSegment, ...remaining];
  }

  private haversineDistance(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number },
  ): number {
    const R = 6371e3;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const deltaLat = toRad(b.latitude - a.latitude);
    const deltaLon = toRad(b.longitude - a.longitude);

    const sinLat = Math.sin(deltaLat / 2);
    const sinLon = Math.sin(deltaLon / 2);

    const aCalc =
      sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
    const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

    return R * c;
  }
}
