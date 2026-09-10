import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:Nov52002%23@localhost:5432/landmaka?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database for Landmaka Phase 1 & 2 Pilot...');

  // 1. Seed or find Pilot Merchant
  const pilotMerchant = await prisma.merchant.upsert({
    where: { apiKey: 'lm_test_key_pilot_01' },
    update: {},
    create: {
      name: 'Pilot Partner Logistics',
      apiKey: 'lm_test_key_pilot_01',
      webhookUrl: 'https://pilot-partner.example.com/webhooks/deliveries',
      rateLimitTier: 'tier_1_pilot',
    },
  });

  console.log(`Merchant ready: ${pilotMerchant.name} (Key: ${pilotMerchant.apiKey})`);

  // 2. Seed pilot delivery zone (Lekki Phase 1)
  const lekkiZonePolygon = JSON.stringify({
    type: 'Polygon',
    coordinates: [
      [
        [3.450, 6.435],
        [3.495, 6.435],
        [3.495, 6.465],
        [3.450, 6.465],
        [3.450, 6.435],
      ],
    ],
  });

  const existingZone = await prisma.zone.findFirst({
    where: { merchantId: pilotMerchant.id, name: 'Lekki Phase 1 Pilot Zone' },
  });

  if (!existingZone) {
    const createdZone = await prisma.zone.create({
      data: {
        merchantId: pilotMerchant.id,
        name: 'Lekki Phase 1 Pilot Zone',
        boundaryGeoJson: lekkiZonePolygon,
        isActive: true,
      },
    });
    console.log(`Created pilot zone: ${createdZone.name}`);
  }

  // 3. Seed sample Lagos delivery locations for the pilot merchant
  const sampleLocations = [
    {
      latitude: 6.5954,
      longitude: 3.3431,
      landmarkText: 'Opposite Ikeja City Mall, Awolowo Way, Ikeja',
      gateDescription: 'Large black gate with private security post on the left',
      unitPath: 'Ground floor, dispatch hub reception area',
      photoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      contactName: 'Ikeja Central Hub',
      contactPhone: '+2348011112222',
      confidenceScore: 0.9,
      status: 'TRUSTED' as const,
      createdBy: 'SYSTEM' as const,
    },
    {
      latitude: 6.4281,
      longitude: 3.4219,
      landmarkText: 'Beside Eko Hotel roundabout, Adetokunbo Ademola, Victoria Island',
      gateDescription: 'Silver sliding metal gate with call box',
      unitPath: 'Block B, 3rd floor, unit 304 (use elevator behind staircase)',
      photoUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      contactName: 'Bisi Adebayo',
      contactPhone: '+2348022223333',
      confidenceScore: 0.8,
      status: 'TRUSTED' as const,
      createdBy: 'CUSTOMER' as const,
    },
    {
      latitude: 6.4474,
      longitude: 3.4842,
      landmarkText: 'Directly opposite FCMB, Admiralty Way, Lekki Phase 1',
      gateDescription: 'Tall black electric gate with spikes, intercom bell on pillar',
      unitPath: 'Walk straight past car park, rear duplex with white pillars',
      photoUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      contactName: 'Emeka Okonkwo',
      contactPhone: '+2348033334444',
      confidenceScore: 0.6,
      status: 'TRUSTED' as const,
      createdBy: 'CUSTOMER' as const,
    },
    {
      latitude: 6.452,
      longitude: 3.472,
      landmarkText: 'Two blocks behind Filmhouse IMAX Cinema, Lekki Phase 1',
      gateDescription: 'Brown wooden decorative gate, pedestrian door unlocked during day',
      unitPath: 'Apartment 4, 1st floor on the left',
      photoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      contactName: 'Chioma Nnamdi',
      contactPhone: '+2348044445555',
      confidenceScore: 0.4,
      status: 'UNVERIFIED' as const,
      createdBy: 'CUSTOMER' as const,
    },
    {
      latitude: 6.5015,
      longitude: 3.3581,
      landmarkText: 'Close to National Stadium, Western Avenue, Surulere',
      gateDescription: 'Green gate with yellow stripes, small security wicket door',
      unitPath: 'Flat 2, ground floor facing the water tank',
      photoUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      contactName: 'Tunde Bakare',
      contactPhone: '+2348055556666',
      confidenceScore: 0.3,
      status: 'UNVERIFIED' as const,
      createdBy: 'CUSTOMER' as const,
    },
    {
      latitude: 6.5165,
      longitude: 3.3768,
      landmarkText: 'Near Ozone Cinemas & E-Center, Commercial Avenue, Yaba',
      gateDescription: 'White gate with red house number 24 painted on the post',
      unitPath: 'Unit 5, back building, second floor',
      photoUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      contactName: 'Fatima Ibrahim',
      contactPhone: '+2348066667777',
      confidenceScore: 0.7,
      status: 'TRUSTED' as const,
      createdBy: 'RIDER' as const,
    },
  ];

  const createdLocations = [];
  for (const loc of sampleLocations) {
    let existing = await prisma.location.findFirst({
      where: {
        merchantId: pilotMerchant.id,
        landmarkText: loc.landmarkText,
      },
    });

    if (!existing) {
      existing = await prisma.location.create({
        data: {
          merchantId: pilotMerchant.id,
          ...loc,
          versions: {
            create: {
              versionNumber: 1,
              latitude: loc.latitude,
              longitude: loc.longitude,
              landmarkText: loc.landmarkText,
              gateDescription: loc.gateDescription,
              unitPath: loc.unitPath,
              photoUrl: loc.photoUrl,
              changeSummary: 'Initial location capture',
            },
          },
        },
      });
      console.log(`Created location: ${existing.landmarkText} (ID: ${existing.id})`);
    }
    createdLocations.push(existing);
  }

  // 4. Seed Pre-Pilot Baseline Deliveries (High calls, higher failures)
  const existingBaseline = await prisma.delivery.findFirst({
    where: { merchantId: pilotMerchant.id, isBaseline: true },
  });

  if (!existingBaseline) {
    const baselineSamples = [
      {
        trackingReference: 'BASE-001',
        recipientName: 'Dare Olatunji',
        recipientPhone: '+2348011223344',
        status: 'DELIVERED' as const,
        isBaseline: true,
        callAttempts: 4,
        transitDurationMinutes: 65,
        notes: 'Rider spent 25 mins asking for compound directions on phone.',
      },
      {
        trackingReference: 'BASE-002',
        recipientName: 'Kemi Adebayo',
        recipientPhone: '+2348022334455',
        status: 'FAILED' as const,
        isBaseline: true,
        callAttempts: 5,
        failureReason: 'COULD_NOT_LOCATE_ADDRESS' as const,
        transitDurationMinutes: 50,
        notes: 'Could not locate customer building; gate lacked number.',
      },
      {
        trackingReference: 'BASE-003',
        recipientName: 'Chinedu Eze',
        recipientPhone: '+2348033445566',
        status: 'DELIVERED' as const,
        isBaseline: true,
        callAttempts: 3,
        transitDurationMinutes: 45,
      },
      {
        trackingReference: 'BASE-004',
        recipientName: 'Amina Bello',
        recipientPhone: '+2348044556677',
        status: 'DELIVERED' as const,
        isBaseline: true,
        callAttempts: 4,
        transitDurationMinutes: 55,
      },
      {
        trackingReference: 'BASE-005',
        recipientName: 'Femi Alabi',
        recipientPhone: '+2348055667788',
        status: 'FAILED' as const,
        isBaseline: true,
        callAttempts: 3,
        failureReason: 'CUSTOMER_UNREACHABLE' as const,
        transitDurationMinutes: 40,
      },
    ];

    for (const b of baselineSamples) {
      await prisma.delivery.create({
        data: {
          merchantId: pilotMerchant.id,
          ...b,
        },
      });
    }
    console.log('Seeded 5 baseline deliveries (pre-pilot metrics).');
  }

  // 5. Seed Active Landmaka Pilot Deliveries (Low calls, zero/low failures)
  const existingPilot = await prisma.delivery.findFirst({
    where: { merchantId: pilotMerchant.id, isBaseline: false },
  });

  if (!existingPilot) {
    const pilotSamples = [
      {
        trackingReference: 'PILOT-101',
        locationId: createdLocations[2]?.id, // Lekki FCMB
        recipientName: 'Emeka Okonkwo',
        recipientPhone: '+2348033334444',
        status: 'DELIVERED' as const,
        isBaseline: false,
        callAttempts: 0,
        transitDurationMinutes: 22,
        notes: 'Found gate immediately from photo and landmark description.',
      },
      {
        trackingReference: 'PILOT-102',
        locationId: createdLocations[3]?.id, // Lekki Filmhouse
        recipientName: 'Chioma Nnamdi',
        recipientPhone: '+2348044445555',
        status: 'DELIVERED' as const,
        isBaseline: false,
        callAttempts: 1,
        transitDurationMinutes: 18,
      },
      {
        trackingReference: 'PILOT-103',
        locationId: createdLocations[1]?.id, // VI Eko Hotel
        recipientName: 'Bisi Adebayo',
        recipientPhone: '+2348022223333',
        status: 'DELIVERED' as const,
        isBaseline: false,
        callAttempts: 0,
        transitDurationMinutes: 28,
      },
      {
        trackingReference: 'PILOT-104',
        locationId: createdLocations[5]?.id, // Yaba Ozone
        recipientName: 'Fatima Ibrahim',
        recipientPhone: '+2348066667777',
        status: 'DELIVERED' as const,
        isBaseline: false,
        callAttempts: 0,
        transitDurationMinutes: 20,
      },
      {
        trackingReference: 'PILOT-105',
        locationId: createdLocations[4]?.id, // Surulere
        recipientName: 'Tunde Bakare',
        recipientPhone: '+2348055556666',
        status: 'DELIVERED' as const,
        isBaseline: false,
        callAttempts: 1,
        transitDurationMinutes: 25,
      },
    ];

    for (const p of pilotSamples) {
      await prisma.delivery.create({
        data: {
          merchantId: pilotMerchant.id,
          ...p,
        },
      });
    }
    console.log('Seeded 5 active pilot deliveries (Landmaka-assisted).');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
