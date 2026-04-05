import { Employee, Schedule, ShiftCode } from "@/types/schedule";
import { isInvalidShiftSequence } from "@/lib/scheduleUtils";

const AGENT_SKILLS: Array<"English" | "Bahasa"> = [
  "English",
  "Bahasa",
  "English",
  "English",
  "Bahasa",
  "English",
  "Bahasa",
  "English",
  "Bahasa",
  "Bahasa",
  "English",
  "Bahasa",
  "Bahasa",
  "Bahasa",
  "Bahasa",
  "English",
  "English",
  "Bahasa",
  "Bahasa",
  "English",
];

const MAIN_PATTERN: ShiftCode[] = ["P1", "P2", "P3", "OFF", "P1", "P2", "OFF"];
const SUPPORT_PATTERN: ShiftCode[] = [
  "S4",
  "S5",
  "S6",
  "S7",
  "OFF",
  "M1",
  "OFF",
];

function makeEmployeeId(index: number, month: number, year: number): string {
  return `emp_seed_${year}_${month}_${index + 1}`;
}

function pickShift(day: number, employeeIndex: number): ShiftCode {
  const pattern = employeeIndex < 10 ? MAIN_PATTERN : SUPPORT_PATTERN;
  let shift = pattern[(day + employeeIndex) % pattern.length];

  // Inject CT (cuti/training) occasionally to mimic spreadsheet distribution.
  if ((day + employeeIndex) % 19 === 0) {
    shift = "CT";
  }

  if (employeeIndex < 10 && shift === "S4") {
    shift = "P4";
  }

  if (employeeIndex >= 10 && shift === "S4" && day % 8 === 0) {
    shift = "S1";
  }

  if (employeeIndex === 18 && day % 11 === 0) {
    shift = "P10";
  }

  return shift;
}

export function createSeedSchedule(
  month: number,
  year: number,
  daysInMonth: number,
  employeeCount = 20,
): { employees: Employee[]; schedule: Schedule } {
  const count = Math.min(employeeCount, 20);

  const employees: Employee[] = Array.from({ length: count }, (_, idx) => ({
    id: makeEmployeeId(idx, month, year),
    no: idx + 1,
    nip: "160001",
    name: `Agent ${String(idx + 1).padStart(3, "0")}`,
    skill: AGENT_SKILLS[idx],
  }));

  const schedule: Schedule = {};

  employees.forEach((employee, employeeIndex) => {
    const employeeSchedule: Record<number, ShiftCode> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      let shift = pickShift(day, employeeIndex);
      const previousShift = employeeSchedule[day - 1] || "OFF";

      // Ensure seed never creates invalid C -> A sequence.
      if (isInvalidShiftSequence(previousShift, shift)) {
        shift = "OFF";
      }

      employeeSchedule[day] = shift;
    }

    schedule[employee.id] = employeeSchedule;
  });

  return { employees, schedule };
}
