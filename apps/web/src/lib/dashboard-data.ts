export interface DeliveryRecord {
  id: string;
  trackingReference: string;
  recipientName: string;
  landmarkText: string;
  gateDescription?: string;
  latitude: number;
  longitude: number;
  riderName: string;
  riderVehicle: string;
  status: 'DELIVERED' | 'EN_ROUTE' | 'ASSIGNED' | 'FAILED';
  confidenceScore: number;
  statusCategory: 'TRUSTED' | 'UNVERIFIED' | 'FLAGGED';
  timeAgo: string;
  callAttempts: number;
  podGeotag?: string;
  podPhotoUrl?: string;
  otpVerified?: boolean;
}

export interface CapturedLocationRecord {
  id: string;
  landmarkText: string;
  gateDescription?: string;
  unitPath?: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  confidenceScore: number;
  status: 'TRUSTED' | 'UNVERIFIED' | 'FLAGGED';
  contactName?: string;
  contactPhone?: string;
  versionsCount: number;
  verifiedCount: number;
  createdAt: string;
}

export const INITIAL_DELIVERIES: DeliveryRecord[] = [
  {
    id: 'DLV-10294',
    trackingReference: 'KWK-LOS-9921',
    recipientName: 'Musa Ibrahim',
    landmarkText: 'Beside Central Mosque, Yellow Gate, Surulere',
    gateDescription: 'Yellow sliding gate, ask for Mallam inside compound',
    latitude: 6.5012,
    longitude: 3.3581,
    riderName: 'Musa Ibrahim',
    riderVehicle: 'Honda Ace 125',
    status: 'EN_ROUTE',
    confidenceScore: 96,
    statusCategory: 'TRUSTED',
    timeAgo: '12m ago',
    callAttempts: 0,
  },
  {
    id: 'DLV-10295',
    trackingReference: 'KWK-LOS-9922',
    recipientName: 'Chinedu Okafor',
    landmarkText: 'Opposite TotalEnergies Station, Admiralty Way, Lekki Phase 1',
    gateDescription: 'Black security gate with intercom buzzer',
    latitude: 6.4474,
    longitude: 3.4731,
    riderName: 'Emeka Nwosu',
    riderVehicle: 'TVS Neo XR',
    status: 'DELIVERED',
    confidenceScore: 98,
    statusCategory: 'TRUSTED',
    timeAgo: '24m ago',
    callAttempts: 1,
    podGeotag: '6.4474° N, 3.4731° E',
    otpVerified: true,
    podPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
  },
  {
    id: 'DLV-10296',
    trackingReference: 'KWK-LOS-9923',
    recipientName: 'Fatima Bello',
    landmarkText: 'Yaba Tech Gate 2, Commercial Ave, Yaba',
    gateDescription: 'Grey gate next to the cybercafe printing shop',
    latitude: 6.5186,
    longitude: 3.3745,
    riderName: 'Babatunde Alabi',
    riderVehicle: 'Bajaj Boxer BM',
    status: 'ASSIGNED',
    confidenceScore: 92,
    statusCategory: 'TRUSTED',
    timeAgo: '38m ago',
    callAttempts: 0,
  },
  {
    id: 'DLV-10297',
    trackingReference: 'KWK-LOS-9924',
    recipientName: 'Tunde Bakare',
    landmarkText: 'Ikeja GRA (Behind Zenith Bank, Isaac John St)',
    gateDescription: 'Conflict: Rider reported blue gate, customer wrote black gate',
    latitude: 6.5923,
    longitude: 3.3562,
    riderName: 'Sunday Oladipo',
    riderVehicle: 'Suzuki AX100',
    status: 'FAILED',
    confidenceScore: 54,
    statusCategory: 'FLAGGED',
    timeAgo: '51m ago',
    callAttempts: 4,
  },
  {
    id: 'DLV-10298',
    trackingReference: 'KWK-LOS-9925',
    recipientName: 'Kemi Adeyemi',
    landmarkText: 'Plot 14, Victoria Island Extension (Glass Building)',
    gateDescription: 'Underground parking security boom barrier',
    latitude: 6.4281,
    longitude: 3.4219,
    riderName: 'Musa Ibrahim',
    riderVehicle: 'Honda Ace 125',
    status: 'DELIVERED',
    confidenceScore: 88,
    statusCategory: 'TRUSTED',
    timeAgo: '1h 04m ago',
    callAttempts: 1,
    podGeotag: '6.4281° N, 3.4219° E',
    otpVerified: true,
    podPhotoUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
  },
  {
    id: 'DLV-10299',
    trackingReference: 'KWK-LOS-9926',
    recipientName: 'Olumide Jacobs',
    landmarkText: 'Off Freedom Way, near Dome Church, Lekki',
    gateDescription: 'White painted perimeter wall, no visible house number',
    latitude: 6.4412,
    longitude: 3.4892,
    riderName: 'Babatunde Alabi',
    riderVehicle: 'Bajaj Boxer BM',
    status: 'ASSIGNED',
    confidenceScore: 61,
    statusCategory: 'UNVERIFIED',
    timeAgo: '1h 22m ago',
    callAttempts: 2,
  },
];

export const INITIAL_LOCATIONS: CapturedLocationRecord[] = [
  {
    id: 'loc_lag_001',
    landmarkText: 'Beside Central Mosque, Yellow Gate, Surulere',
    gateDescription: 'Yellow sliding gate, ask for Mallam inside compound',
    unitPath: 'Ground floor, rear flat',
    latitude: 6.5012,
    longitude: 3.3581,
    confidenceScore: 96,
    status: 'TRUSTED',
    contactName: 'Musa Ibrahim',
    contactPhone: '+234 802 334 1122',
    versionsCount: 3,
    verifiedCount: 5,
    createdAt: '2 days ago',
  },
  {
    id: 'loc_lag_002',
    landmarkText: 'Opposite TotalEnergies Station, Admiralty Way, Lekki Phase 1',
    gateDescription: 'Black security gate with intercom buzzer',
    unitPath: 'Building B, 2nd floor',
    latitude: 6.4474,
    longitude: 3.4731,
    confidenceScore: 98,
    status: 'TRUSTED',
    contactName: 'Chinedu Okafor',
    contactPhone: '+234 803 445 9911',
    versionsCount: 4,
    verifiedCount: 8,
    createdAt: '5 days ago',
  },
  {
    id: 'loc_lag_003',
    landmarkText: 'Yaba Tech Gate 2, Commercial Ave, Yaba',
    gateDescription: 'Grey gate next to the cybercafe printing shop',
    unitPath: 'Upstairs room 12',
    latitude: 6.5186,
    longitude: 3.3745,
    confidenceScore: 92,
    status: 'TRUSTED',
    contactName: 'Fatima Bello',
    contactPhone: '+234 818 223 8844',
    versionsCount: 2,
    verifiedCount: 4,
    createdAt: '1 week ago',
  },
  {
    id: 'loc_lag_004',
    landmarkText: 'Ikeja GRA (Behind Zenith Bank, Isaac John St)',
    gateDescription: 'Black gate (Rider flagged blue gate mismatch)',
    unitPath: 'Left duplex',
    latitude: 6.5923,
    longitude: 3.3562,
    confidenceScore: 54,
    status: 'FLAGGED',
    contactName: 'Tunde Bakare',
    contactPhone: '+234 809 111 2233',
    versionsCount: 2,
    verifiedCount: 1,
    createdAt: '3 hours ago',
  },
  {
    id: 'loc_lag_005',
    landmarkText: 'Plot 14, Victoria Island Extension (Glass Building)',
    gateDescription: 'Underground parking security boom barrier',
    unitPath: 'Floor 4, Suite 402',
    latitude: 6.4281,
    longitude: 3.4219,
    confidenceScore: 88,
    status: 'TRUSTED',
    contactName: 'Kemi Adeyemi',
    contactPhone: '+234 805 776 5544',
    versionsCount: 3,
    verifiedCount: 6,
    createdAt: '3 days ago',
  },
  {
    id: 'loc_lag_006',
    landmarkText: 'Off Freedom Way, near Dome Church, Lekki',
    gateDescription: 'White painted perimeter wall, no house number',
    unitPath: 'Main entrance door',
    latitude: 6.4412,
    longitude: 3.4892,
    confidenceScore: 61,
    status: 'UNVERIFIED',
    contactName: 'Olumide Jacobs',
    contactPhone: '+234 812 345 6789',
    versionsCount: 1,
    verifiedCount: 1,
    createdAt: 'Just now',
  },
];
