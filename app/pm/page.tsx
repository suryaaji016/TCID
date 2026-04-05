"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePMData } from "@/hooks/usePMData";

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

export default function PMDashboardPage() {
  const [month, setMonth] = useState(4);
  const [year, setYear] = useState(2026);
  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [month, year],
  );
  const { agents, schedule, seatsByCity } = usePMData({
    month,
    year,
    daysInMonth,
  });

  const employees = agents;

  const totalSlots = employees.length * daysInMonth;
  const offSlots = Object.values(schedule).reduce(
    (acc, row) => acc + Object.values(row).filter((s) => s === "OFF").length,
    0,
  );
  const ctSlots = Object.values(schedule).reduce(
    (acc, row) => acc + Object.values(row).filter((s) => s === "CT").length,
    0,
  );
  const workingSlots = totalSlots - offSlots;
  const workRate = totalSlots === 0 ? 0 : (workingSlots / totalSlots) * 100;
  const offRate = totalSlots === 0 ? 0 : (offSlots / totalSlots) * 100;
  const manualOverrideRate =
    totalSlots === 0 ? 0 : (ctSlots / totalSlots) * 100;
  const totalSeats = Object.values(seatsByCity).reduce(
    (acc, citySeats) => acc + Object.keys(citySeats).length,
    0,
  );
  const occupiedSeats = Object.values(seatsByCity).reduce(
    (acc, citySeats) => acc + Object.values(citySeats).filter(Boolean).length,
    0,
  );
  const mappedRate = totalSeats === 0 ? 0 : (occupiedSeats / totalSeats) * 100;

  const shiftCount = new Map<string, number>();
  Object.values(schedule).forEach((row) => {
    Object.values(row).forEach((shift) => {
      if (shift === "OFF" || shift === "CT") return;
      shiftCount.set(shift, (shiftCount.get(shift) || 0) + 1);
    });
  });

  const topShifts = Array.from(shiftCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const m1Count = shiftCount.get("M1") || 0;
  const m1Rate = workingSlots === 0 ? 0 : (m1Count / workingSlots) * 100;

  const dailyRows = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const w = employees.filter((emp) => {
      const v = schedule[emp.id]?.[day] || "OFF";
      return v !== "OFF" && v !== "CT";
    }).length;
    const o = employees.length - w;
    const pct = employees.length === 0 ? 0 : (w / employees.length) * 100;
    const dateLabel = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { day, w, o, pct, dateLabel };
  });

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-slate-100">
          Dashboard Schedule Bulanan
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-base text-slate-400">Bulan</span>
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="h-8 w-32.5 bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((item) => (
                <SelectItem
                  key={item.value}
                  value={String(item.value)}
                >{`${item.label} ${year}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2">
          <div className="text-sm text-slate-400">Working Rate</div>
          <div className="text-3xl font-bold text-[#059669]">
            {workRate.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2">
          <div className="text-sm text-slate-400">OFF Rate</div>
          <div className="text-3xl font-bold text-[#ef4444]">
            {offRate.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2">
          <div className="text-sm text-slate-400">Manual Override</div>
          <div className="text-3xl font-bold text-[#f97316]">
            {manualOverrideRate.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2">
          <div className="text-sm text-slate-400">M1 dari Working Shift</div>
          <div className="text-3xl font-bold text-[#4f46e5]">
            {m1Rate.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2">
          <div className="text-sm text-slate-400">Total Slot Bulanan</div>
          <div className="text-3xl font-bold text-slate-100">{totalSlots}</div>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2">
          <div className="text-sm text-slate-400">Agent Sudah Mapping Seat</div>
          <div className="text-3xl font-bold text-[#c026d3]">
            {mappedRate.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2">
          <h3 className="mb-2 text-2xl font-semibold text-slate-100">
            Distribusi Shift (Working)
          </h3>
          <div className="space-y-1">
            {topShifts.map(([shift, count]) => (
              <div
                key={shift}
                className="flex items-center justify-between rounded border border-slate-700 px-2 py-1 text-sm text-slate-200"
              >
                <span>{shift}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-2">
          <h3 className="mb-2 text-2xl font-semibold text-slate-100">
            Schedule Harian (Working vs OFF)
          </h3>
          <div className="max-h-87.5 space-y-1 overflow-auto pr-1">
            {dailyRows.map((row) => (
              <div
                key={row.day}
                className="flex items-center justify-between rounded border border-slate-700 px-2 py-1 text-sm text-slate-200"
              >
                <span>{row.dateLabel}</span>
                <span>{`W: ${row.w} | OFF: ${row.o} | ${row.pct.toFixed(1)}%`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
