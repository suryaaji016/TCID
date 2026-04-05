"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Employee, Schedule, ShiftCode } from "@/types/schedule";
import { calculateWorkDays, calculateMonthlyHours } from "@/lib/scheduleUtils";
import {
  SHIFT_COLORS,
  SHIFT_LABELS,
  SHIFT_OPTIONS,
  SUMMARY_SHIFTS,
} from "@/lib/shiftConfig";

interface SummaryPanelProps {
  schedule: Schedule;
  employees: Employee[];
  daysInMonth: number;
  month: number;
  year: number;
}

export default function SummaryPanel({
  schedule,
  employees,
  daysInMonth,
  month,
  year,
}: SummaryPanelProps) {
  const summaryPerDay: Record<number, Record<ShiftCode, number>> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    summaryPerDay[day] = Object.fromEntries(
      SHIFT_OPTIONS.map((shift) => [shift, 0]),
    ) as Record<ShiftCode, number>;

    employees.forEach((emp) => {
      const shift = schedule[emp.id]?.[day] || "OFF";
      summaryPerDay[day][shift]++;
    });
  }

  const totalByShift = Object.fromEntries(
    SHIFT_OPTIONS.map((shift) => [shift, 0]),
  ) as Record<ShiftCode, number>;

  Object.values(summaryPerDay).forEach((day) => {
    Object.keys(day).forEach((shift) => {
      totalByShift[shift as ShiftCode] += day[shift as ShiftCode];
    });
  });

  const avgPerShift = SUMMARY_SHIFTS.reduce(
    (acc, shift) => {
      acc[shift] = (totalByShift[shift] / daysInMonth).toFixed(1);
      return acc;
    },
    {} as Record<ShiftCode, string>,
  );

  // Kalkulasi per karyawan
  const employeeStats = employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    workDays: calculateWorkDays(schedule[emp.id] || {}, daysInMonth),
    monthlyHours: calculateMonthlyHours(schedule[emp.id] || {}, daysInMonth),
  }));

  return (
    <div className="lg:col-span-4 space-y-4">
      {/* Total Shift Coverage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rata-rata Coverage Harian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {SUMMARY_SHIFTS.map((shift) => (
              <div
                key={shift}
                className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"
              >
                <div className="text-sm font-semibold text-slate-300">
                  {shift}
                </div>
                <div className="text-lg font-bold text-slate-100">
                  {avgPerShift[shift]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistik Karyawan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Statistik Karyawan ({month}/{year})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {employeeStats.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">
                Belum ada data karyawan
              </div>
            ) : (
              employeeStats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex items-center justify-between rounded-lg bg-slate-800/80 p-2"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-100">
                      {stat.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {stat.workDays} hari kerja • {stat.monthlyHours} jam/bulan
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Legenda Shift Code</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {SHIFT_OPTIONS.map((shift) => (
            <div key={shift} className="flex items-center gap-2">
              <Badge className={`border text-xs ${SHIFT_COLORS[shift]}`}>
                {shift}
              </Badge>
              <span className="text-sm text-slate-300">
                {SHIFT_LABELS[shift]}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
