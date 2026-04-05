"use client";

import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee, Schedule, ShiftCode } from "@/types/schedule";
import { SHIFT_COLORS, SHIFT_LABELS, SHIFT_OPTIONS } from "@/lib/shiftConfig";
import { calculateWorkDays } from "@/lib/scheduleUtils";

interface ScheduleTableProps {
  schedule: Schedule;
  employees: Employee[];
  daysInMonth: number;
  onUpdateShift: (employeeId: string, day: number, shift: ShiftCode) => void;
  onRemoveEmployee: (employeeId: string) => void;
  readOnly?: boolean;
}

export default function ScheduleTable({
  schedule,
  employees,
  daysInMonth,
  onUpdateShift,
  onRemoveEmployee,
  readOnly = false,
}: ScheduleTableProps) {
  const getDays = () => Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getShiftForEmployee = (employeeId: string, day: number): ShiftCode => {
    return schedule[employeeId]?.[day] || "OFF";
  };

  const handleShiftChange = (
    employeeId: string,
    day: number,
    newShift: ShiftCode,
  ) => {
    // Validate shift sequence
    const previousDay = day - 1;

    if (previousDay > 0) {
      const previousShift = getShiftForEmployee(employeeId, previousDay);

      if (newShift === "P1" && previousShift === "M1") {
        alert("❌ Tidak boleh shift M1 langsung diikuti P1");
        return;
      }
    }

    onUpdateShift(employeeId, day, newShift);
  };

  const hasPreviousDayIssue = (employeeId: string, day: number): boolean => {
    if (day === 1) return false;
    const currentShift = getShiftForEmployee(employeeId, day);
    const previousShift = getShiftForEmployee(employeeId, day - 1);
    return currentShift === "P1" && previousShift === "M1";
  };

  const getWeekday = (day: number) => {
    const date = new Date(2026, 3, day);
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
  };

  return (
    <ScrollArea className="w-full rounded-lg border border-slate-700 bg-slate-900/70">
      <div className="inline-block min-w-full">
        <table className="w-full table-fixed border-collapse">
          <thead className="sticky top-0 z-40">
            <tr className="border-b-2 border-slate-700 bg-linear-to-b from-slate-800 to-slate-700">
              <th className="sticky left-0 z-50 w-14 border-r border-slate-600 bg-slate-700 px-2 py-2 text-center text-xs font-semibold text-slate-100">
                No
              </th>
              <th className="sticky left-14 z-50 w-24 border-r border-slate-600 bg-slate-700 px-2 py-2 text-center text-xs font-semibold text-slate-100">
                NIP
              </th>
              <th className="sticky left-38 z-50 w-36 border-r border-slate-600 bg-slate-700 px-3 py-2 text-left text-xs font-semibold text-slate-100">
                Karyawan
              </th>
              <th className="sticky left-74 z-50 w-24 border-r border-slate-600 bg-slate-700 px-2 py-2 text-center text-xs font-semibold text-slate-100">
                Skill
              </th>
              {getDays().map((day) => (
                <th
                  key={day}
                  className="min-w-13 border-r border-slate-600 px-1 py-1 text-center text-[11px] font-semibold text-slate-100"
                >
                  <div>{String(day).padStart(2, "0")}</div>
                  <div className="text-[10px] font-medium text-slate-300">
                    {getWeekday(day)}
                  </div>
                </th>
              ))}
              <th className="min-w-16 border-r border-slate-600 px-2 py-2 text-center text-xs font-semibold text-slate-100">
                Work Day
              </th>
              <th className="min-w-16 border-r border-slate-600 px-2 py-2 text-center text-xs font-semibold text-slate-100">
                Off Day
              </th>
              <th className="min-w-13 px-2 py-2 text-center text-xs font-semibold text-slate-100">
                OT
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={daysInMonth + 7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Belum ada karyawan. Klik "Tambah Karyawan" untuk mulai.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-slate-700/80 hover:bg-slate-800/50"
                >
                  <td className="sticky left-0 z-30 w-14 border-r border-slate-700 bg-slate-900 px-2 py-2 text-center text-xs font-medium text-slate-200">
                    {employee.no}
                  </td>
                  <td className="sticky left-14 z-30 w-24 border-r border-slate-700 bg-slate-900 px-2 py-2 text-center text-xs text-slate-200">
                    {employee.nip}
                  </td>
                  <td className="sticky left-38 z-30 w-36 border-r border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{employee.name}</span>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveEmployee(employee.id)}
                          className="h-5 w-5 p-0 text-rose-300 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="sticky left-74 z-30 w-24 border-r border-slate-700 bg-slate-900 px-2 py-2 text-center text-xs text-slate-200">
                    {employee.skill}
                  </td>

                  {getDays().map((day) => {
                    const shift = getShiftForEmployee(employee.id, day);
                    const hasIssue = hasPreviousDayIssue(employee.id, day);

                    return (
                      <td
                        key={`${employee.id}-${day}`}
                        className="relative min-w-13 border-r border-slate-700 px-1 py-1 text-center"
                      >
                        <Select
                          value={shift}
                          onValueChange={(val) =>
                            handleShiftChange(
                              employee.id,
                              day,
                              val as ShiftCode,
                            )
                          }
                        >
                          <SelectTrigger
                            disabled={readOnly}
                            title={`${shift} - ${SHIFT_LABELS[shift]}`}
                            className={`w-full h-7 rounded-[2px] border px-1 text-[10px] font-bold leading-none ${SHIFT_COLORS[shift]} ${hasIssue ? "ring-2 ring-red-500" : ""}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIFT_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {hasIssue && (
                          <div className="absolute -top-1 -right-1">
                            <AlertTriangle className="w-4 h-4 text-red-500 fill-red-100" />
                          </div>
                        )}
                      </td>
                    );
                  })}

                  <td className="border-r border-slate-700 px-2 py-2 text-center text-xs font-semibold text-slate-200">
                    {calculateWorkDays(
                      schedule[employee.id] || {},
                      daysInMonth,
                    )}
                  </td>
                  <td className="border-r border-slate-700 px-2 py-2 text-center text-xs font-semibold text-slate-200">
                    {daysInMonth -
                      calculateWorkDays(
                        schedule[employee.id] || {},
                        daysInMonth,
                      )}
                  </td>
                  <td className="px-2 py-2 text-center text-xs font-semibold text-slate-200">
                    0
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
}
