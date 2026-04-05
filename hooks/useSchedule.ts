"use client";

import { useState, useCallback, useEffect } from "react";
import { Employee, Schedule, ShiftCode } from "@/types/schedule";
import { validateSchedule, isInvalidShiftSequence } from "@/lib/scheduleUtils";
import { createSeedSchedule } from "@/lib/scheduleSeed";

interface UseScheduleOptions {
  month: number;
  year: number;
  daysInMonth: number;
}

export function useSchedule({ month, year, daysInMonth }: UseScheduleOptions) {
  const [seedVersion, setSeedVersion] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>(() => {
    return createSeedSchedule(month, year, daysInMonth).employees;
  });
  const [schedule, setSchedule] = useState<Schedule>(() => {
    return createSeedSchedule(month, year, daysInMonth).schedule;
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const addEmployee = useCallback(
    (name: string) => {
      const newId = `emp_${Date.now()}`;
      const newEmployee: Employee = {
        id: newId,
        no: employees.length + 1,
        nip: "160001",
        name,
        skill: "English",
      };

      setEmployees((prev) => [...prev, newEmployee]);
      setSchedule((prev) => ({
        ...prev,
        [newId]: {},
      }));
    },
    [employees.length],
  );

  const removeEmployee = useCallback((employeeId: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      delete newSchedule[employeeId];
      return newSchedule;
    });
  }, []);

  const updateShift = useCallback(
    (employeeId: string, day: number, shift: ShiftCode) => {
      // Validate if it's the second day onwards
      if (day > 1) {
        const previousShift = schedule[employeeId]?.[day - 1] || "OFF";

        // Check invalid sequence: C -> A
        if (isInvalidShiftSequence(previousShift, shift)) {
          alert("❌ Tidak boleh shift Malam (C) langsung diikuti Pagi (A)");
          return;
        }
      }

      setSchedule((prev) => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          [day]: shift,
        },
      }));
    },
    [schedule],
  );

  const reseedSchedule = useCallback(
    (employeeCount = 20) => {
      const seeded = createSeedSchedule(
        month,
        year,
        daysInMonth,
        employeeCount,
      );
      setEmployees(seeded.employees);
      setSchedule(seeded.schedule);
      setSeedVersion((prev) => prev + 1);
    },
    [daysInMonth, month, year],
  );

  const clearSchedule = useCallback(() => {
    setEmployees([]);
    setSchedule({});
    setValidationErrors([]);
  }, []);

  useEffect(() => {
    const errors = validateSchedule(schedule, daysInMonth);
    setValidationErrors(errors);
  }, [daysInMonth, schedule]);

  useEffect(() => {
    const seeded = createSeedSchedule(month, year, daysInMonth, 20);
    setEmployees(seeded.employees);
    setSchedule(seeded.schedule);
  }, [daysInMonth, month, year]);

  return {
    schedule,
    employees,
    addEmployee,
    removeEmployee,
    updateShift,
    reseedSchedule,
    clearSchedule,
    seedVersion,
    validationErrors,
  };
}
