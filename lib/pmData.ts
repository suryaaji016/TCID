import { Employee, Schedule, ShiftCode } from "@/types/schedule";
import { createSeedSchedule } from "@/lib/scheduleSeed";

export type City = "Jakarta" | "Jogja" | "Semarang";

export interface PMAgent extends Employee {
  email: string;
  password: string;
  english: boolean;
}

export interface PMDataState {
  agents: PMAgent[];
  schedulesByPeriod: Record<string, Schedule>;
  seatsByCity: Record<City, Record<string, string | null>>;
}

export const PM_DATA_KEY = "tcid_pm_data_v2";

export function getPeriodKey(year: number, month: number): string {
  return `${year}-${month}`;
}

function makeSeats(
  prefix: string,
  count: number,
): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (let i = 1; i <= count; i++) {
    const seat = `${prefix}-${String(i).padStart(2, "0")}`;
    result[seat] = null;
  }
  return result;
}

function createInitialAgents(seedEmployees: Employee[]): PMAgent[] {
  return seedEmployees.map((employee) => {
    const normalized = employee.name.toLowerCase().replace(/\s+/g, "");
    return {
      ...employee,
      email: `${normalized}@gmail.com`,
      password: "agent123",
      english: employee.skill === "English",
    };
  });
}

export function generateScheduleForAgents(
  agents: PMAgent[],
  year: number,
  month: number,
  daysInMonth: number,
): Schedule {
  const seed = createSeedSchedule(month, year, daysInMonth, agents.length);
  const schedule: Schedule = {};

  agents.forEach((agent, idx) => {
    const seededEmployee = seed.employees[idx];
    const seededSchedule = seededEmployee
      ? seed.schedule[seededEmployee.id]
      : undefined;
    schedule[agent.id] = seededSchedule ? { ...seededSchedule } : {};
  });

  return schedule;
}

export function createInitialPMData(): PMDataState {
  const month = 4;
  const year = 2026;
  const daysInMonth = 30;
  const seed = createSeedSchedule(month, year, daysInMonth, 20);
  const agents = createInitialAgents(seed.employees);

  const seatsByCity: PMDataState["seatsByCity"] = {
    Jakarta: makeSeats("JAK", 20),
    Jogja: makeSeats("JOG", 20),
    Semarang: makeSeats("SEM", 20),
  };

  seatsByCity.Jakarta["JAK-02"] = agents[1]?.id || null;
  seatsByCity.Jakarta["JAK-03"] = agents[19]?.id || null;
  seatsByCity.Jakarta["JAK-05"] = agents[12]?.id || null;
  seatsByCity.Jakarta["JAK-13"] = agents[9]?.id || null;
  seatsByCity.Jogja["JOG-01"] = agents[8]?.id || null;
  seatsByCity.Jogja["JOG-03"] = agents[7]?.id || null;
  seatsByCity.Semarang["SEM-02"] = agents[0]?.id || null;
  seatsByCity.Semarang["SEM-07"] = agents[4]?.id || null;

  return {
    agents,
    schedulesByPeriod: {
      [getPeriodKey(year, month)]: Object.fromEntries(
        agents.map((agent, index) => {
          const seeded = seed.schedule[seed.employees[index].id] || {};
          return [agent.id, seeded];
        }),
      ),
    },
    seatsByCity,
  };
}

export function findSeatForAgent(
  seatsByCity: PMDataState["seatsByCity"],
  agentId: string,
): { city: City; seat: string } | null {
  const cities: City[] = ["Jakarta", "Jogja", "Semarang"];
  for (const city of cities) {
    for (const [seat, mappedAgentId] of Object.entries(seatsByCity[city])) {
      if (mappedAgentId === agentId) {
        return { city, seat };
      }
    }
  }
  return null;
}

export function updateShiftSafe(
  schedule: Schedule,
  agentId: string,
  day: number,
  shift: ShiftCode,
): Schedule {
  return {
    ...schedule,
    [agentId]: {
      ...schedule[agentId],
      [day]: shift,
    },
  };
}
