export type ShiftCode =
  | "P1"
  | "P2"
  | "P3"
  | "P4"
  | "P10"
  | "S1"
  | "S4"
  | "S5"
  | "S6"
  | "S7"
  | "M1"
  | "OFF"
  | "CT";

export interface Employee {
  id: string;
  no: number;
  nip: string;
  name: string;
  skill: "English" | "Bahasa";
}

export type Schedule = Record<string, Record<number, ShiftCode>>;

export interface ScheduleEntry {
  employeeId: string;
  day: number;
  shift: ShiftCode;
}
