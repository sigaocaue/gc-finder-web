// Resposta padrão da API: { data: T | null, message: string }
export interface ApiResponse<T> {
  data: T | null
  message: string
}

// GET /api/v1/public/gcs/map
export interface GcMapItem {
  id: string
  name: string
  latitude: number
  longitude: number
  neighborhood: string | null
  city: string | null
}

// GET /api/v1/public/gcs/nearby?zip_code=...
export interface GcNearbyItem extends GcMapItem {
  distance_km: number
}

// GET /api/v1/gcs (lista e detalhe)
export interface GcResponse {
  id: string
  name: string
  description: string | null
  zip_code: string
  street: string
  number: string | null
  complement: string | null
  neighborhood: string
  city: string
  state: string
  latitude: number | null
  longitude: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  leaders: LeaderBrief[]
  meetings: GcMeetingResponse[]
  medias: GcMediaResponse[]
}

// Contato do líder
export interface LeaderContactResponse {
  id: string
  type: string
  value: string
  label: string | null
  created_at: string
}

// GET /api/v1/leaders
export interface LeaderResponse {
  id: string
  name: string
  display_name?: string
  bio: string | null
  photo_url: string | null
  is_active: boolean
  contacts: LeaderContactResponse[]
  created_at: string
}

// Resumo do líder no detalhe do GC
export interface LeaderBrief {
  id: string
  name: string
  contacts: LeaderContactResponse[]
}

// Encontro de GC
export interface GcMeetingResponse {
  id: string
  gc_id: string
  weekday: number
  start_time: string
  notes: string | null
  created_at: string
}

// Mídia de GC
export interface GcMediaResponse {
  id: string
  gc_id: string
  type: string
  url: string
  caption: string | null
  display_order: number
  created_at: string
}

// POST /api/v1/public/interest
export interface InterestRequest {
  name: string
  email: string
  phone: string
  zip_code: string
  age?: number
  marital_status?: string
  has_children?: boolean
  availability?: string
  is_member?: boolean
  serves_in_ministry?: boolean
  how_did_you_hear?: string
  how_did_you_hear_other?: string
  message?: string
  gc_id?: string
}

// POST /api/v1/auth/login
export interface LoginRequest {
  email: string
  password: string
}

// POST /api/v1/auth/refresh
export interface RefreshRequest {
  refresh_token: string
}

// Resposta de tokens
export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

// ApiResponse<TokenResponse> (usado no login e refresh)
export interface AuthTokens {
  data: TokenResponse | null
  message: string
}

// GET /api/v1/auth/me e GET /api/v1/users
export interface UserResponse {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'user'
  is_active: boolean
  created_at: string
}

// GET /api/v1/stats/counts
export interface StatsCountsResponse {
  users: number
  leaders: number
  gcs: number
  meetings: number
  medias: number
  leader_contacts: number
}

// Payload para criação inline de encontros (usado no POST /gcs)
export interface GcMeetingInlineCreate {
  weekday: number
  start_time: string
  notes?: string
}

// Payload para criação inline de mídias (usado no POST /gcs)
export interface GcMediaInlineCreate {
  type: string
  url: string
  caption?: string
  display_order?: number
}

// POST /api/v1/gcs
export interface GcCreate {
  name: string
  description?: string
  zip_code: string
  street: string
  number?: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  leaders?: string[]
  meetings?: GcMeetingInlineCreate[]
  medias?: GcMediaInlineCreate[]
}

// PUT /api/v1/gcs/{id}
export interface GcUpdate {
  name?: string
  description?: string
  zip_code?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  is_active?: boolean
}

// POST /api/v1/gcs/{id}/leaders
export interface GcLeaderLink {
  leader_id: string
}

// POST /api/v1/gcs/{id}/meetings
export interface GcMeetingCreate {
  weekday: number
  start_time: string
  notes?: string
}

// Resposta da API ViaCEP
export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

// Mapeamento de dias da semana (0=segunda..6=domingo) usado no POST /gcs
export const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Segunda-feira',
  1: 'Terça-feira',
  2: 'Quarta-feira',
  3: 'Quinta-feira',
  4: 'Sexta-feira',
  5: 'Sábado',
  6: 'Domingo',
}

// Contato para criação de líder
export interface LeaderContactCreate {
  type: string
  value: string
  label?: string
}
