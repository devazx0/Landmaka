'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  landmarkText: string;
  gateDescription?: string | null;
  unitPath?: string | null;
  photoUrl?: string | null;
  confidenceScore: number;
  status: 'UNVERIFIED' | 'TRUSTED' | 'FLAGGED';
  contactName?: string | null;
}

export interface SequencedRouteStop {
  sequenceIndex: number;
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  notes?: string;
  distanceFromPreviousMeters: number;
  durationFromPreviousSeconds: number;
}

interface MapComponentProps {
  locations: MapLocation[];
  origin?: { latitude: number; longitude: number; label?: string } | null;
  routeStops?: SequencedRouteStop[];
  routePolyline?: [number, number][]; // [lon, lat]
  onMapClick?: (coords: { latitude: number; longitude: number }) => void;
  selectedLocationId?: string | null;
}

export default function MapComponent({
  locations,
  origin,
  routeStops = [],
  routePolyline,
  onMapClick,
  selectedLocationId,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Lagos, Nigeria
    const map = L.map(mapContainerRef.current, {
      center: [6.48, 3.42],
      zoom: 12,
      zoomControl: true,
    });

    // Dark-themed OpenStreetMap tiles (CartoDB Voyager)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      },
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({
          latitude: Number(e.latlng.lat.toFixed(6)),
          longitude: Number(e.latlng.lng.toFixed(6)),
        });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onMapClick]);

  // Update Markers and Route Lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Map stop sequence for quick lookup: locationId or lat/lng
    const sequenceMap = new Map<string, number>();
    routeStops.forEach((s) => {
      sequenceMap.set(`${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`, s.sequenceIndex);
      sequenceMap.set(s.id, s.sequenceIndex);
    });

    // 1. Render Origin Marker if provided
    if (origin) {
      const originIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background: #2563eb; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.6);">
            HUB
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const originMarker = L.marker([origin.latitude, origin.longitude], {
        icon: originIcon,
      }).bindPopup(`
        <div style="font-size: 13px;">
          <strong style="color: #60a5fa;">Start / Dispatch Hub</strong>
          <p style="margin: 4px 0 0 0; color: #9ca3af;">${origin.label || 'Dispatch Origin'}</p>
          <p style="font-family: monospace; font-size: 11px; margin: 4px 0 0 0; color: #6b7280;">${origin.latitude.toFixed(4)}, ${origin.longitude.toFixed(4)}</p>
        </div>
      `);
      markersLayer.addLayer(originMarker);
    }

    // 2. Render Stored Locations
    locations.forEach((loc) => {
      const coordKey = `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`;
      const seqIndex = sequenceMap.get(coordKey) || sequenceMap.get(loc.id);

      const isTrusted = loc.status === 'TRUSTED';
      const bgColor = seqIndex
        ? '#3b82f6'
        : isTrusted
        ? '#10b981'
        : '#f59e0b';

      const iconLabel = seqIndex ? `#${seqIndex}` : isTrusted ? '✓' : '!';

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background: ${bgColor}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); cursor: pointer;">
            ${iconLabel}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const popupHtml = `
        <div style="min-width: 220px; font-size: 13px; line-height: 1.4;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${isTrusted ? '#064e3b' : '#78350f'}; color: ${isTrusted ? '#6ee7b7' : '#fde68a'};">
              ${loc.status} (${Math.round(loc.confidenceScore * 100)}%)
            </span>
            ${seqIndex ? `<span style="font-size: 11px; font-weight: bold; color: #60a5fa;">Stop ${seqIndex}</span>` : ''}
          </div>
          <strong style="color: #f3f4f6; display: block; margin-bottom: 4px;">${loc.landmarkText}</strong>
          ${loc.gateDescription ? `<p style="margin: 2px 0; color: #9ca3af;"><span style="color: #cbd5e1; font-weight: 500;">Gate:</span> ${loc.gateDescription}</p>` : ''}
          ${loc.unitPath ? `<p style="margin: 2px 0; color: #9ca3af;"><span style="color: #cbd5e1; font-weight: 500;">Path:</span> ${loc.unitPath}</p>` : ''}
          ${loc.contactName ? `<p style="margin: 2px 0; color: #9ca3af;"><span style="color: #cbd5e1; font-weight: 500;">Contact:</span> ${loc.contactName}</p>` : ''}
          ${
            loc.photoUrl
              ? `<div style="margin-top: 8px; border-radius: 6px; overflow: hidden; max-height: 100px;">
                  <img src="${loc.photoUrl}" alt="Entrance" style="width: 100%; object-fit: cover; height: 90px;" />
                </div>`
              : ''
          }
          <div style="font-family: monospace; font-size: 10px; color: #6b7280; margin-top: 6px;">
            ${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}
          </div>
        </div>
      `;

      const marker = L.marker([loc.latitude, loc.longitude], { icon }).bindPopup(popupHtml);
      markersLayer.addLayer(marker);

      if (loc.id === selectedLocationId) {
        marker.openPopup();
      }
    });

    // 3. Render Route Polyline
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routePolyline && routePolyline.length > 1) {
      const latLngs: [number, number][] = routePolyline.map(([lon, lat]) => [lat, lon]);
      const polyline = L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '8, 8',
      }).addTo(map);

      routeLayerRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [locations, origin, routeStops, routePolyline, selectedLocationId]);

  return (
    <div className="relative w-full h-full min-h-[550px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 shadow-lg pointer-events-none">
        <p className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          Trusted Location
        </p>
        <p className="flex items-center gap-2 mt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          Unverified Location
        </p>
        <p className="flex items-center gap-2 mt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          Sequenced Stop
        </p>
      </div>
    </div>
  );
}
