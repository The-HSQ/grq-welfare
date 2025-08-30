import { z } from "zod";

export const shiftSchema = z.object({
  shift_no: z.string().min(1, "Shift number is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
});

export type ShiftFormData = z.infer<typeof shiftSchema>;

export const shiftFormFields = [
  {
    name: "shift_no",
    label: "Shift Number",
    type: "text" as const,
    placeholder: "Enter shift number (e.g., Shift 1, Shift 2, Shift 3)",
    required: true,
  },
  {
    name: "start_time",
    label: "Start Time",
    type: "time" as const,
    placeholder: "Select start time",
    required: true,
  },
  {
    name: "end_time",
    label: "End Time",
    type: "time" as const,
    placeholder: "Select end time",
    required: true,
  },
];

export interface Shift {
  id: string;
  shift_no: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface CreateShiftData {
  shift_no: string;
  start_time: string;
  end_time: string;
}

export interface UpdateShiftData {
  shift_no?: string;
  start_time?: string;
  end_time?: string;
}
