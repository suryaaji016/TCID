"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Schedule, ShiftCode } from "@/types/schedule";
import {
  createInitialPMData,
  findSeatForAgent,
  generateScheduleForAgents,
  getPeriodKey,
  PMAgent,
  PM_DATA_KEY,
  PMDataState,
  City,
  updateShiftSafe,
} from "@/lib/pmData";

function isValidStateShape(value: unknown): value is PMDataState {
  if (!value || typeof value !== "object") return false;

  const state = value as PMDataState;
  if (!Array.isArray(state.agents)) return false;
  if (!state.schedulesByPeriod || typeof state.schedulesByPeriod !== "object")
    return false;
  if (!state.seatsByCity || typeof state.seatsByCity !== "object") return false;

  const requiredCities: City[] = ["Jakarta", "Jogja", "Semarang"];
  for (const city of requiredCities) {
    const citySeats = state.seatsByCity[city];
    if (!citySeats || typeof citySeats !== "object") return false;
  }

  for (const agent of state.agents) {
    if (!agent || typeof agent !== "object") return false;
    if (typeof agent.id !== "string") return false;
    if (typeof agent.name !== "string") return false;
    if (typeof agent.email !== "string") return false;
    if (typeof agent.password !== "string") return false;
    if (typeof agent.english !== "boolean") return false;
    if (agent.skill !== "English" && agent.skill !== "Bahasa") return false;
  }

  return true;
}

function loadState(): PMDataState {
  if (typeof window === "undefined") {
    return createInitialPMData();
  }

  const raw = localStorage.getItem(PM_DATA_KEY);
  if (!raw) {
    return createInitialPMData();
  }

  try {
    const parsed = JSON.parse(raw);
    if (isValidStateShape(parsed)) {
      return parsed;
    }

    const fresh = createInitialPMData();
    localStorage.setItem(PM_DATA_KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    const fresh = createInitialPMData();
    localStorage.setItem(PM_DATA_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function persistState(state: PMDataState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PM_DATA_KEY, JSON.stringify(state));
}

interface UsePMDataOptions {
  month: number;
  year: number;
  daysInMonth: number;
}

export function usePMData({ month, year, daysInMonth }: UsePMDataOptions) {
  const [state, setState] = useState<PMDataState>(() => loadState());
  const periodKey = getPeriodKey(year, month);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      const raw = localStorage.getItem(PM_DATA_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        if (isValidStateShape(parsed)) {
          setState(parsed);
        }
      } catch {
        // Ignore malformed localStorage payload and keep current in-memory state.
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== PM_DATA_KEY) return;
      syncFromStorage();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncFromStorage);
    document.addEventListener("visibilitychange", syncFromStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncFromStorage);
      document.removeEventListener("visibilitychange", syncFromStorage);
    };
  }, []);

  const schedule = useMemo(() => {
    const existing = state.schedulesByPeriod[periodKey];
    if (existing) {
      return existing;
    }

    return generateScheduleForAgents(state.agents, year, month, daysInMonth);
  }, [
    daysInMonth,
    month,
    periodKey,
    state.agents,
    state.schedulesByPeriod,
    year,
  ]);

  const setAndPersist = useCallback(
    (updater: (prev: PMDataState) => PMDataState) => {
      setState((prev) => {
        const next = updater(prev);
        persistState(next);
        return next;
      });
    },
    [],
  );

  const ensurePeriod = useCallback(() => {
    setAndPersist((prev) => {
      if (prev.schedulesByPeriod[periodKey]) return prev;
      return {
        ...prev,
        schedulesByPeriod: {
          ...prev.schedulesByPeriod,
          [periodKey]: generateScheduleForAgents(
            prev.agents,
            year,
            month,
            daysInMonth,
          ),
        },
      };
    });
  }, [daysInMonth, month, periodKey, setAndPersist, year]);

  const updateShift = useCallback(
    (agentId: string, day: number, shift: ShiftCode) => {
      setAndPersist((prev) => {
        const current =
          prev.schedulesByPeriod[periodKey] ||
          generateScheduleForAgents(prev.agents, year, month, daysInMonth);
        return {
          ...prev,
          schedulesByPeriod: {
            ...prev.schedulesByPeriod,
            [periodKey]: updateShiftSafe(current, agentId, day, shift),
          },
        };
      });
    },
    [daysInMonth, month, periodKey, setAndPersist, year],
  );

  const clearMonthSchedule = useCallback(() => {
    setAndPersist((prev) => {
      const emptySchedule = prev.agents.reduce<Schedule>((acc, agent) => {
        const days = Array.from(
          { length: daysInMonth },
          (_, idx) => idx + 1,
        ).reduce<Record<number, ShiftCode>>((dayAcc, day) => {
          dayAcc[day] = "OFF";
          return dayAcc;
        }, {});

        acc[agent.id] = days;
        return acc;
      }, {});

      return {
        ...prev,
        schedulesByPeriod: {
          ...prev.schedulesByPeriod,
          [periodKey]: emptySchedule,
        },
      };
    });
  }, [daysInMonth, periodKey, setAndPersist]);

  const regenerateMonthSchedule = useCallback(() => {
    setAndPersist((prev) => ({
      ...prev,
      schedulesByPeriod: {
        ...prev.schedulesByPeriod,
        [periodKey]: generateScheduleForAgents(
          prev.agents,
          year,
          month,
          daysInMonth,
        ),
      },
    }));
  }, [daysInMonth, month, periodKey, setAndPersist, year]);

  const setMonthSchedule = useCallback(
    (nextSchedule: Schedule) => {
      setAndPersist((prev) => ({
        ...prev,
        schedulesByPeriod: {
          ...prev.schedulesByPeriod,
          [periodKey]: nextSchedule,
        },
      }));
    },
    [periodKey, setAndPersist],
  );

  const addAgent = useCallback(
    (payload: {
      name: string;
      email: string;
      password: string;
      english: boolean;
    }) => {
      setAndPersist((prev) => {
        const nextNo = prev.agents.length + 1;
        const id = `agent_${Date.now()}`;
        const agent: PMAgent = {
          id,
          no: nextNo,
          nip: "160001",
          name: payload.name,
          skill: payload.english ? "English" : "Bahasa",
          english: payload.english,
          email: payload.email,
          password: payload.password,
        };

        const nextAgents = [...prev.agents, agent];
        const nextSchedulesByPeriod = { ...prev.schedulesByPeriod };

        Object.keys(nextSchedulesByPeriod).forEach((key) => {
          nextSchedulesByPeriod[key] = {
            ...nextSchedulesByPeriod[key],
            [id]: Object.fromEntries(
              Array.from({ length: daysInMonth }, (_, idx) => [idx + 1, "OFF"]),
            ),
          };
        });

        return {
          ...prev,
          agents: nextAgents,
          schedulesByPeriod: nextSchedulesByPeriod,
        };
      });
    },
    [daysInMonth, setAndPersist],
  );

  const updateAgent = useCallback(
    (agentId: string, patch: Partial<PMAgent>) => {
      setAndPersist((prev) => ({
        ...prev,
        agents: prev.agents.map((agent) =>
          agent.id === agentId
            ? {
                ...agent,
                ...patch,
                skill: (patch.english ?? agent.english) ? "English" : "Bahasa",
              }
            : agent,
        ),
      }));
    },
    [setAndPersist],
  );

  const removeAgent = useCallback(
    (agentId: string) => {
      setAndPersist((prev) => {
        const nextAgents = prev.agents
          .filter((agent) => agent.id !== agentId)
          .map((agent, index) => ({
            ...agent,
            no: index + 1,
          }));

        const nextSchedulesByPeriod = Object.fromEntries(
          Object.entries(prev.schedulesByPeriod).map(([key, schedule]) => {
            const { [agentId]: _deleted, ...restSchedule } = schedule;
            return [key, restSchedule];
          }),
        );

        const nextSeatsByCity = {
          Jakarta: Object.fromEntries(
            Object.entries(prev.seatsByCity.Jakarta).map(([seat, mapped]) => [
              seat,
              mapped === agentId ? null : mapped,
            ]),
          ),
          Jogja: Object.fromEntries(
            Object.entries(prev.seatsByCity.Jogja).map(([seat, mapped]) => [
              seat,
              mapped === agentId ? null : mapped,
            ]),
          ),
          Semarang: Object.fromEntries(
            Object.entries(prev.seatsByCity.Semarang).map(([seat, mapped]) => [
              seat,
              mapped === agentId ? null : mapped,
            ]),
          ),
        };

        return {
          ...prev,
          agents: nextAgents,
          schedulesByPeriod: nextSchedulesByPeriod,
          seatsByCity: nextSeatsByCity,
        };
      });
    },
    [setAndPersist],
  );

  const assignSeat = useCallback(
    (city: City, seat: string, agentId: string | null) => {
      setAndPersist((prev) => {
        const nextSeats = {
          Jakarta: { ...prev.seatsByCity.Jakarta },
          Jogja: { ...prev.seatsByCity.Jogja },
          Semarang: { ...prev.seatsByCity.Semarang },
        };

        if (agentId) {
          const existing = findSeatForAgent(nextSeats, agentId);
          if (existing) {
            nextSeats[existing.city][existing.seat] = null;
          }
        }

        nextSeats[city][seat] = agentId;

        return {
          ...prev,
          seatsByCity: nextSeats,
        };
      });
    },
    [setAndPersist],
  );

  const clearSeatsByCity = useCallback(
    (city: City) => {
      setAndPersist((prev) => ({
        ...prev,
        seatsByCity: {
          ...prev.seatsByCity,
          [city]: Object.fromEntries(
            Object.keys(prev.seatsByCity[city]).map((seat) => [seat, null]),
          ),
        },
      }));
    },
    [setAndPersist],
  );

  const seatLookup = useMemo(() => {
    const byAgent: Record<string, string> = {};
    (["Jakarta", "Jogja", "Semarang"] as City[]).forEach((city) => {
      Object.entries(state.seatsByCity[city]).forEach(([seat, agentId]) => {
        if (agentId) {
          byAgent[agentId] = `${city} - ${seat}`;
        }
      });
    });
    return byAgent;
  }, [state.seatsByCity]);

  return {
    agents: state.agents,
    seatsByCity: state.seatsByCity,
    schedule,
    seatLookup,
    ensurePeriod,
    updateShift,
    setMonthSchedule,
    clearMonthSchedule,
    regenerateMonthSchedule,
    addAgent,
    updateAgent,
    removeAgent,
    assignSeat,
    clearSeatsByCity,
  };
}
