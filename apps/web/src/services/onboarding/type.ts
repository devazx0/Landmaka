export interface OnboardPayload {
  orgName: string;
  leadName: string;
  adminEmail: string;
  deliveryTier: string;
  password: string;
  profile: 'logistics' | 'ecommerce' | 'quickcommerce';
  techStack: string;
  corridor: string;
  webhookUrl?: string;
}

export interface OnboardResponse {
  success: boolean;
  message: string;
  merchant: {
    id: string;
    name: string;
    slug: string;
    profile: string;
    techStack: string;
    corridor: string;
    deliveryTier: string;
    webhookUrl: string | null;
    createdAt: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  credentials: {
    secretKey: string;
    clientKey: string;
  };
  zone: {
    id: string;
    name: string;
  };
  token: string;
}

export interface PingResponse {
  status: string;
  message: string;
  timestamp: number;
  cluster: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    merchantId: string;
  };
  merchant: {
    id: string;
    name: string;
    slug: string;
  };
  token: string;
}

export interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  merchant: {
    id: string;
    name: string;
    slug: string;
    rateLimitTier?: string;
  } | null;
}
