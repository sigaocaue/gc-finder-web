// Resposta padrão da API: { data: T, message: string }
export interface ApiResponse<T> {
  data: T;
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
export interface LeaderContact {
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
  contacts: LeaderContact[];
  created_at: string;
}

// Encontro de GC
export interface GcMeeting {
  id: string;
  day_of_week: string;
  time: string;
  notes: string | null;
}

// Mídia de GC
export interface GcMedia {
  id: string;
  type: "image" | "instagram" | "video";
  url: string;
  caption: string | null;
  order: number;
}

// GET /api/v1/gcs/{id} (detalhe)
export interface GcDetailResponse extends GcResponse {
  leaders: LeaderResponse[];
  meetings: GcMeeting[];
  medias: GcMedia[];
}

// POST /api/v1/public/interest
export interface InterestFormData {
  name: string;
  email: string;
  phone: string;
  zip_code: string;
  message?: string;
  gc_id?: string;
}

// Autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokensData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthTokens {
  data: AuthTokensData;
  message: string;
}
