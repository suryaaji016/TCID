import { ShiftCode } from "@/types/schedule";

export const SHIFT_OPTIONS: ShiftCode[] = [
  "P1",
  "P2",
  "P3",
  "P4",
  "P10",
  "S1",
  "S4",
  "S5",
  "S6",
  "S7",
  "M1",
  "CT",
  "OFF",
];

export const SHIFT_LABELS: Record<ShiftCode, string> = {
  P1: "06:00 - 15:00",
  P2: "07:00 - 16:00",
  P3: "08:00 - 17:00",
  P4: "09:00 - 18:00",
  P10: "10:00 - 19:00",
  S1: "11:00 - 20:00",
  S4: "12:00 - 21:00",
  S5: "13:00 - 22:00",
  S6: "14:00 - 23:00",
  S7: "15:00 - 00:00",
  M1: "22:00 - 07:00",
  CT: "Cuti/Training",
  OFF: "Off Day",
};

export const SHIFT_HOURS: Record<ShiftCode, number> = {
  P1: 9,
  P2: 9,
  P3: 9,
  P4: 9,
  P10: 9,
  S1: 9,
  S4: 9,
  S5: 9,
  S6: 9,
  S7: 9,
  M1: 9,
  CT: 0,
  OFF: 0,
};

export const SHIFT_COLORS: Record<ShiftCode, string> = {
  P1: "bg-[#7ec8f5] text-[#0f172a] border-[#5ca9d9]",
  P2: "bg-[#a4d8ff] text-[#0f172a] border-[#6cbef2]",
  P3: "bg-[#c9e8ff] text-[#0f172a] border-[#8ec8ef]",
  P4: "bg-[#bce8f3] text-[#0f172a] border-[#89cddb]",
  P10: "bg-[#9be4f2] text-[#0f172a] border-[#6fc9db]",
  S1: "bg-[#ffe26f] text-[#0f172a] border-[#f1c94a]",
  S4: "bg-[#ffd25d] text-[#0f172a] border-[#eabf3f]",
  S5: "bg-[#5ec8ff] text-white border-[#39afe6]",
  S6: "bg-[#50b8f2] text-white border-[#2da2de]",
  S7: "bg-[#3ba4df] text-white border-[#248fcf]",
  M1: "bg-[#6e5db9] text-white border-[#5747a1]",
  CT: "bg-[#f5a623] text-white border-[#d88f1b]",
  OFF: "bg-[#ff2d2d] text-white border-[#e01414]",
};

export const SUMMARY_SHIFTS: ShiftCode[] = ["P1", "P2", "P3", "OFF", "CT"];
