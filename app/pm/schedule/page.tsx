"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePMData } from "@/hooks/usePMData";
import { SHIFT_LABELS, SHIFT_OPTIONS } from "@/lib/shiftConfig";
import { downloadScheduleCsv } from "@/lib/exporters";
import { toast } from "sonner";
import { Schedule, ShiftCode } from "@/types/schedule";

const MONTH_OPTIONS = [
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

export default function PMSchedulePage() {
  const [month, setMonth] = useState(4);
  const year = 2026;
  const [selectedDay, setSelectedDay] = useState(1);
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-04-30");
  const [forecastPerDay, setForecastPerDay] = useState("13");

  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [month, year],
  );
  const monthPadded = String(month).padStart(2, "0");
  const dayPadded = String(selectedDay).padStart(2, "0");
  const monthStartDate = `${year}-${monthPadded}-01`;
  const monthEndDate = `${year}-${monthPadded}-${String(daysInMonth).padStart(2, "0")}`;
  const monthLabel =
    MONTH_OPTIONS.find((item) => item.value === month)?.label ||
    `Bulan ${month}`;
  const {
    agents,
    schedule,
    seatLookup,
    updateShift,
    setMonthSchedule,
    clearMonthSchedule,
    ensurePeriod,
  } = usePMData({ month, year, daysInMonth });

  const employees = agents;

  useEffect(() => {
    ensurePeriod();
  }, [ensurePeriod]);

  useEffect(() => {
    setStartDate(monthStartDate);
    setEndDate(monthEndDate);
    setSelectedDay((prev) => Math.min(prev, daysInMonth));
  }, [daysInMonth, monthEndDate, monthStartDate]);

  const dayColumns = Array.from(
    { length: Math.min(daysInMonth, 30) },
    (_, i) => i + 1,
  );
  const shiftSummaryRows = [
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
  ];

  const dailyCoverage = dayColumns.map((day) => {
    const working = employees.filter((emp) => {
      const v = schedule[emp.id]?.[day] || "OFF";
      return v !== "OFF" && v !== "CT";
    }).length;
    return { day, working, off: employees.length - working };
  });

  const updateManual = (employeeId: string, value: string) => {
    updateShift(
      employeeId,
      selectedDay,
      value as (typeof SHIFT_OPTIONS)[number],
    );
  };

  const handleSaveAll = () => {
    toast.success("Perubahan schedule berhasil disimpan.");
  };

  const handleExportCsv = () => {
    downloadScheduleCsv({
      year,
      month,
      daysInMonth,
      agents: employees,
      schedule,
    });
    toast.success("File CSV berhasil diexport.");
  };

  const handleGenerate = () => {
    const requested = Number.parseInt(forecastPerDay, 10);
    if (!Number.isFinite(requested) || requested <= 0) {
      toast.error("Forecast per Day harus lebih dari 0.");
      return;
    }

    const target = Math.min(employees.length, requested);

    const parseDay = (value: string, fallback: number) => {
      const chunks = value.split("-");
      if (chunks.length !== 3) return fallback;
      const day = Number.parseInt(chunks[2], 10);
      if (!Number.isFinite(day)) return fallback;
      return Math.min(daysInMonth, Math.max(1, day));
    };

    const rawStartDay = parseDay(startDate, 1);
    const rawEndDay = parseDay(endDate, daysInMonth);
    const startDay = Math.min(rawStartDay, rawEndDay);
    const endDay = Math.max(rawStartDay, rawEndDay);

    const generated: Schedule = Object.fromEntries(
      employees.map((emp) => [emp.id, { ...(schedule[emp.id] || {}) }]),
    );
    const shiftCycle: ShiftCode[] = [
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
    ];

    const shuffled = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
    const pickRandom = <T,>(arr: T[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    for (let day = startDay; day <= endDay; day++) {
      const todayOrder = shuffled(employees);
      const workingSet = new Set(
        todayOrder.slice(0, target).map((emp) => emp.id),
      );

      employees.forEach((emp) => {
        if (workingSet.has(emp.id)) {
          generated[emp.id][day] = pickRandom(shiftCycle);
          return;
        }

        generated[emp.id][day] = Math.random() < 0.2 ? "CT" : "OFF";
      });
    }

    setMonthSchedule(generated);
    toast.success(
      `Schedule berhasil digenerate (${startDay}-${endDay}, forecast ${target}/hari).`,
    );
  };

  const handleClearMonth = () => {
    clearMonthSchedule();
    toast.success("Schedule bulan ini berhasil dikosongkan.");
  };

  const handleSaveDay = () => {
    toast.success(
      `Perubahan tanggal ${String(selectedDay).padStart(2, "0")} berhasil disimpan.`,
    );
  };

  return (
    <div className="space-y-3 text-slate-100">
      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <h2 className="text-3xl font-semibold text-slate-100">
          Ringkasan Schedule Bulanan
        </h2>
        <p className="text-sm text-slate-400">
          Tampilan ringkas per tanggal dalam bulan terpilih.
        </p>

        <div className="mt-2 w-70">
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="h-8 border-slate-600 bg-slate-800 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={String(item.value)}>
                  {`${item.label} ${year}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2 overflow-auto rounded border border-slate-700 bg-slate-950/60">
          <table className="min-w-325 border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800">
                <th className="border border-slate-700 px-2 py-1 text-left">
                  Agent
                </th>
                <th className="border border-slate-700 px-2 py-1 text-left">
                  Lang
                </th>
                <th className="border border-slate-700 px-2 py-1 text-left">
                  Seat
                </th>
                {dayColumns.map((day) => (
                  <th
                    key={day}
                    className="border border-slate-700 px-2 py-1 text-center"
                  >
                    {String(day).padStart(2, "0")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="border border-slate-700 px-2 py-1 text-slate-200">
                    {emp.name.toLowerCase().replace(" ", "")}
                  </td>
                  <td className="border border-slate-700 px-2 py-1 text-slate-300">
                    {emp.skill === "English" ? "EN" : "NON"}
                  </td>
                  <td className="border border-slate-700 px-2 py-1 text-slate-300">
                    {seatLookup[emp.id] || "-"}
                  </td>
                  {dayColumns.map((day) => {
                    const val = schedule[emp.id]?.[day] || "OFF";
                    const color =
                      val === "OFF"
                        ? "bg-rose-950/40 text-rose-300"
                        : val === "CT"
                          ? "bg-amber-950/40 text-amber-300"
                          : "bg-emerald-950/35 text-sky-300";

                    return (
                      <td
                        key={`${emp.id}-${day}`}
                        className={`border border-slate-700 px-1 py-1 text-center ${color}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-slate-800/80 font-semibold">
                <td className="border border-slate-700 px-2 py-1" colSpan={3}>
                  Sched/Day
                </td>
                {dailyCoverage.map((row) => (
                  <td
                    key={`sched-${row.day}`}
                    className="border border-slate-700 px-1 py-1 text-center text-emerald-300"
                  >
                    {row.working}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-800/80 font-semibold">
                <td className="border border-slate-700 px-2 py-1" colSpan={3}>
                  Off/Day
                </td>
                {dailyCoverage.map((row) => (
                  <td
                    key={`off-${row.day}`}
                    className="border border-slate-700 px-1 py-1 text-center text-rose-300"
                  >
                    {row.off}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 overflow-auto rounded border border-slate-700 bg-slate-950/60">
          <table className="min-w-325 border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800">
                <th className="border border-slate-700 px-2 py-1 text-left">
                  Shift
                </th>
                <th className="border border-slate-700 px-2 py-1 text-left">
                  Jam
                </th>
                {dayColumns.map((day) => (
                  <th
                    key={`shift-h-${day}`}
                    className="border border-slate-700 px-2 py-1 text-center"
                  >
                    {String(day).padStart(2, "0")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shiftSummaryRows.map((shift) => (
                <tr key={shift}>
                  <td className="border border-slate-700 px-2 py-1">{shift}</td>
                  <td className="border border-slate-700 px-2 py-1 text-slate-300">
                    {SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS]}
                  </td>
                  {dayColumns.map((day) => {
                    const count = employees.filter(
                      (emp) => (schedule[emp.id]?.[day] || "OFF") === shift,
                    ).length;
                    return (
                      <td
                        key={`${shift}-${day}`}
                        className="border border-slate-700 px-1 py-1 text-center"
                      >
                        <Input
                          className="h-6 rounded-sm text-center"
                          value={String(count)}
                          readOnly
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-slate-800/80 font-semibold">
                <td className="border border-slate-700 px-2 py-1" colSpan={2}>
                  Sched/Day
                </td>
                {dailyCoverage.map((row) => (
                  <td
                    key={`sum-s-${row.day}`}
                    className="border border-slate-700 px-1 py-1 text-center text-emerald-300"
                  >
                    {row.working}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-800/80 font-semibold">
                <td className="border border-slate-700 px-2 py-1" colSpan={2}>
                  Off/Day
                </td>
                {dailyCoverage.map((row) => (
                  <td
                    key={`sum-o-${row.day}`}
                    className="border border-slate-700 px-1 py-1 text-center text-rose-300"
                  >
                    {row.off}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-2 flex gap-2">
          <Button
            variant="secondary"
            className="h-8 border border-slate-600 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
            onClick={handleSaveAll}
          >
            Save Perubahan Shift
          </Button>
          <Button
            variant="secondary"
            className="h-8 border border-emerald-500/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
            onClick={handleExportCsv}
          >
            Export Excel
          </Button>
          <Button
            variant="secondary"
            className="h-8 border border-emerald-500/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
            onClick={handleGenerate}
          >
            Generate Ulang
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <h2 className="text-3xl font-semibold text-slate-100">
          Generate Semi Otomatis
        </h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div>
            <label className="text-sm text-slate-300">Start Date</label>
            <Input
              type="date"
              className="mt-1 border-slate-600 bg-slate-800 text-slate-100"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={monthStartDate}
              max={monthEndDate}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">End Date</label>
            <Input
              type="date"
              className="mt-1 border-slate-600 bg-slate-800 text-slate-100"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={monthStartDate}
              max={monthEndDate}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Forecast per Day</label>
            <Input
              className="mt-1 border-slate-600 bg-slate-800 text-slate-100"
              value={forecastPerDay}
              onChange={(e) => setForecastPerDay(e.target.value)}
            />
          </div>
        </div>
        <Button className="mt-2 h-8" onClick={handleGenerate}>
          Generate
        </Button>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <h2 className="text-3xl font-semibold text-slate-100">
          Edit Manual Schedule
        </h2>

        <div className="mt-2 w-70">
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="h-8 border-slate-600 bg-slate-800 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={String(item.value)}>
                  {`${item.label} ${year}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {dayColumns.map((day) => (
            <button
              key={`btn-${day}`}
              onClick={() => setSelectedDay(day)}
              className={`h-8 min-w-8 rounded border px-2 text-xs ${
                selectedDay === day
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-600 bg-slate-800 text-slate-300"
              }`}
            >
              {String(day).padStart(2, "0")}
            </button>
          ))}
        </div>

        <p className="mt-2 text-sm text-rose-300">
          Tanggal {`${year}-${monthPadded}-01`} terkunci karena sudah lewat 1x24
          jam.
        </p>
        <Button
          variant="outline"
          className="mt-2 h-8 border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
          onClick={handleClearMonth}
        >
          Clear Bulan {monthLabel} {year}
        </Button>

        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-300">
              <th className="py-2">Tanggal</th>
              <th className="py-2">Agent</th>
              <th className="py-2">Shift</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const val = schedule[emp.id]?.[selectedDay] || "OFF";
              const offRow = val === "OFF";
              return (
                <tr
                  key={`manual-${emp.id}`}
                  className={`border-b border-slate-700 ${offRow ? "bg-rose-950/20" : ""}`}
                >
                  <td className="py-2">{`${year}-${monthPadded}-${dayPadded}`}</td>
                  <td className="py-2">
                    {emp.name.replace(" ", "").toLowerCase()}
                  </td>
                  <td className="py-2">
                    <Select
                      value={val}
                      onValueChange={(v) => updateManual(emp.id, v)}
                    >
                      <SelectTrigger className="h-8 w-55 border-slate-600 bg-slate-800 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option} ({SHIFT_LABELS[option]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${emp.skill === "English" ? "bg-emerald-500/25 text-emerald-200" : "bg-slate-700 text-slate-300"}`}
                    >
                      {emp.skill === "English" ? "English" : "Non-English"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-2 flex justify-end">
          <Button
            className="h-8 bg-sky-600 text-white hover:bg-sky-500"
            onClick={handleSaveDay}
          >
            Save ({`${year}-${monthPadded}-${dayPadded}`})
          </Button>
        </div>
      </section>
    </div>
  );
}
