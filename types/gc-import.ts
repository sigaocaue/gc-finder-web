// Tipos do fluxo de importação de GC por imagem

export interface LeaderContactExtracted {
  type: string;
  value: string;
  label: string | null;
}

export interface LeaderExtracted {
  name: string;
  contacts: LeaderContactExtracted[];
}

export interface MeetingExtracted {
  weekday: number;
  start_time: string;
  notes: string | null;
}

export interface GcExtractedData {
  name: string;
  description: string | null;
  zip_code: string | null;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  leaders: LeaderExtracted[];
  meetings: MeetingExtracted[];
}

export interface ImportJobStarted {
  job_id: string;
  status: string;
  events_url: string;
  status_url: string;
}

export type ImportStep = "input" | "extracting" | "review" | "success";

export interface SseStatusEvent {
  status: string;
  message: string;
}

export interface ImportJobStatus {
  job_id: string;
  status: "pending" | "processing" | "done" | "error";
  result: GcExtractedData | null;
  error_message: string | null;
}

// Resposta ao salvar o GC importado
export interface GcSavedResponse {
  id: string;
  name: string;
}
