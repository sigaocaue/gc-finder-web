// Tipos do fluxo de importação de GC por imagem

// Serviços OCR disponíveis no backend
export type OcrServiceName = "easyocr" | "tesseract" | "google_documentai";

// Labels para exibição no select de OCR
export const OCR_SERVICE_LABELS: Record<OcrServiceName, string> = {
  easyocr: "EasyOCR (padrão)",
  tesseract: "Tesseract",
  google_documentai: "Google Document AI",
};

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
  weekday: number; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  start_time: string; // "HH:MM"
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
  stream_url: string;
}

export type ImportStep = "input" | "extracting" | "review" | "success";

// Evento SSE unificado — o campo "status" determina o tipo
export interface SseStatusEvent {
  status: "pending" | "processing" | "done" | "failed";
  progress?: string;
  result?: GcExtractedData[];
  error?: string;
}

// Evento de heartbeat (ignorar na UI)
export interface SseHeartbeatEvent {
  ts: string;
}

export interface GcImportState {
  step: ImportStep;
  jobId: string | null;
  ocrService: OcrServiceName;
  extractionProgress: string | null;
  extractedDataList: GcExtractedData[];
  savedGcIds: string[];
  isStartingJob: boolean;
  isSaving: boolean;
  startError: string | null;
  saveError: string | null;
}

// Resposta ao salvar o GC importado
export interface GcSavedResponse {
  id: string;
  name: string;
}
