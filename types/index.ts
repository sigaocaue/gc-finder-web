// Resposta padrão da API: { data: T | null, message: string }
export interface ApiResponse<T> {
  data: T | null;
  message: string;
}

// GET /api/v1/public/gcs/map
export interface GcMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  neighborhood: string | null;
  city: string | null;
}

// GET /api/v1/public/gcs/nearby?zip_code=...
export interface GcNearbyItem extends GcMapItem {
  distance_km: number;
}

// GET /api/v1/gcs (lista) e resposta base de GC
export interface GcResponse {
  id: string;
  name: string;
  description: string | null;
  zip_code: string;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
}

// Contato do líder
export interface LeaderContactResponse {
  id: string;
  type: string;
  value: string;
  label: string | null;
  created_at: string;
}

// GET /api/v1/leaders
export interface LeaderResponse {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  contacts: LeaderContactResponse[];
  created_at: string;
}

// Resumo do líder no detalhe do GC
export interface LeaderBrief {
  id: string;
  name: string;
  contacts: LeaderContactResponse[];
  is_primary: boolean;
}

// Encontro de GC
export interface GcMeetingResponse {
  id: string;
  gc_id: string;
  weekday: number;
  start_time: string;
  notes: string | null;
  created_at: string;
}

// Mídia de GC
export interface GcMediaResponse {
  id: string;
  gc_id: string;
  type: string;
  url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

// GET /api/v1/gcs/{id} (detalhe)
export interface GcDetailResponse extends GcResponse {
  leaders: LeaderBrief[];
  meetings: GcMeetingResponse[];
  medias: GcMediaResponse[];
}

// POST /api/v1/public/interest
export interface InterestRequest {
  name: string;
  email: string;
  phone: string;
  zip_code: string;
  message?: string | null;
}

// POST /api/v1/auth/login
export interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/v1/auth/refresh
export interface RefreshRequest {
  refresh_token: string;
}

// Resposta de tokens
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ApiResponse<TokenResponse> (usado no login e refresh)
export interface AuthTokens {
  data: TokenResponse | null;
  message: string;
}

// GET /api/v1/auth/me e GET /api/v1/users
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}
