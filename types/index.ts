export interface GcAddress {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface GcMeeting {
  id: string;
  dayOfWeek: string;
  time: string;
  notes: string | null;
}

export interface GcLeader {
  id: string;
  name: string;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  isPrimary: boolean;
}

export interface GcMedia {
  id: string;
  type: "image" | "instagram" | "video";
  url: string;
  caption: string | null;
  order: number;
}

export interface Gc {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  address: GcAddress;
  meetings: GcMeeting[];
  leaders: GcLeader[];
  media: GcMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface GcListItem {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  isActive: boolean;
  latitude: number;
  longitude: number;
}

export interface InterestFormData {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  message?: string;
  gcId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NearbyGcResponse {
  gc: Gc;
  distance: number;
}
