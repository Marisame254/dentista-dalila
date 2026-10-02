export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Appointment {
  id: string;
  created_at: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  service: string;
  starts_at: string;
  duration_min: number;
  status: AppointmentStatus;
  patient_note: string | null;
  admin_note: string | null;
  source: "web" | "panel";
}

export interface Message {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  body: string;
  appointment_id: string | null;
  read_at: string | null;
  archived: boolean;
}

export interface BlockedTime {
  id: string;
  created_at: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  no_show: "No asistió",
};
