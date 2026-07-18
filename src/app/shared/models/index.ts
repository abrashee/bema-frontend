export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface ApiResponse<T> {
  timestamp: string;
  message: string;
  data: T;
}

export interface AuthData {
  token: string;
  refreshToken: string;
  user: User;
}

export type AuthResponse = ApiResponse<AuthData>;

export interface Claim {
  id: string;
  status: string;
  userId: string;
  amount?: number;
  description?: string;
  policyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimCreateRequest {
  policyId?: string;
  amount?: number;
  description: string;
}

export interface ClaimUpdateRequest {
  status: string;
  description?: string;
}

export interface Policy {
  id: number;
  identityId: string;
  type: 'CAR' | 'HEALTH' | 'LIFE' | 'HOME' | 'TRAVEL' | 'PET' | 'GADGET' | 'BUSINESS' | 'RENTAL' | 'CYBER';
  premium: number;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyCreateRequest {
  type: Policy['type'];
  premium: number;
  startDate: string;
  endDate: string;
}

export interface PolicyUpdateRequest extends PolicyCreateRequest {}
