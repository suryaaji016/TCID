import { ShiftCode } from "@/types/schedule";
import { SHIFT_HOURS, SHIFT_OPTIONS } from "@/lib/shiftConfig";

/**
 * Validasi apakah shift sequence C (malam) langsung ke A (pagi) tidak boleh terjadi
 */
export function isInvalidShiftSequence(
  previousShift: ShiftCode,
  currentShift: ShiftCode,
): boolean {
  return (
    previousShift === "M1" && (currentShift === "P1" || currentShift === "P2")
  );
}

/**
 * Hitung jam kerja untuk satu shift
 */
export function calculateShiftHours(shift: ShiftCode): number {
  return SHIFT_HOURS[shift];
}

/**
 * Hitung total hari kerja (tidak libur) untuk satu karyawan
 */
export function calculateWorkDays(
  employeeSchedule: Record<number, ShiftCode>,
  daysInMonth: number,
): number {
  let workDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const shift = employeeSchedule[day] || "OFF";
    if (shift !== "OFF" && shift !== "CT") {
      workDays++;
    }
  }

  return workDays;
}

/**
 * Hitung total jam kerja per bulan untuk satu karyawan
 */
export function calculateMonthlyHours(
  employeeSchedule: Record<number, ShiftCode>,
  daysInMonth: number,
): number {
  let totalHours = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const shift = employeeSchedule[day] || "OFF";
    totalHours += SHIFT_HOURS[shift];
  }

  return totalHours;
}

/**
 * Validasi seluruh jadwal untuk error shift sequence
 */
export function validateSchedule(
  schedule: Record<string, Record<number, ShiftCode>>,
  daysInMonth: number,
): string[] {
  const errors: string[] = [];

  Object.entries(schedule).forEach(([_, employeeSchedule]) => {
    for (let day = 2; day <= daysInMonth; day++) {
      const currentShift = employeeSchedule[day] || "OFF";
      const previousShift = employeeSchedule[day - 1] || "OFF";

      if (isInvalidShiftSequence(previousShift, currentShift)) {
        // Get employee name if available (you may need to pass employees separately)
        errors.push(
          `⚠️ Tanggal ${day}: Shift ${previousShift} tidak boleh langsung diikuti ${currentShift}`,
        );
      }
    }
  });

  return errors;
}

/**
 * Export schedule ke format array untuk perhitungan lanjutan
 */
export function getScheduleStatistics(
  schedule: Record<string, Record<number, ShiftCode>>,
  employees: Array<{ id: string; name: string }>,
  daysInMonth: number,
) {
  const stats = {
    employeeWorkDays: new Map<string, number>(),
    employeeMonthlyHours: new Map<string, number>(),
    shiftCoverage: new Map<number, Record<ShiftCode, number>>(),
  };

  // Hitung per karyawan
  employees.forEach((emp) => {
    const empSchedule = schedule[emp.id] || {};
    stats.employeeWorkDays.set(
      emp.id,
      calculateWorkDays(empSchedule, daysInMonth),
    );
    stats.employeeMonthlyHours.set(
      emp.id,
      calculateMonthlyHours(empSchedule, daysInMonth),
    );
  });

  // Hitung coverage per hari
  for (let day = 1; day <= daysInMonth; day++) {
    const coverage = Object.fromEntries(
      SHIFT_OPTIONS.map((shift) => [shift, 0]),
    ) as Record<ShiftCode, number>;

    employees.forEach((emp) => {
      const shift = schedule[emp.id]?.[day] || "OFF";
      coverage[shift]++;
    });

    stats.shiftCoverage.set(day, coverage);
  }

  return stats;
}
