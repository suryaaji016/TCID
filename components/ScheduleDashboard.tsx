"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Database, Plus, RefreshCw, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScheduleTable from "@/components/ScheduleTable";
import SummaryPanel from "@/components/SummaryPanel";
import { useSchedule } from "@/hooks/useSchedule";

interface ScheduleDashboardProps {
  role: "pm" | "agent";
  onLogout?: () => void;
}

export default function ScheduleDashboard({
  role,
  onLogout,
}: ScheduleDashboardProps) {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [seedCount, setSeedCount] = useState<number>(20);
  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [month, year],
  );

  const {
    schedule,
    employees,
    addEmployee,
    removeEmployee,
    updateShift,
    reseedSchedule,
    clearSchedule,
    seedVersion,
    validationErrors,
  } = useSchedule({ month, year, daysInMonth });

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const handleAddEmployee = () => {
    const name = prompt("Masukkan nama karyawan:");
    if (name && name.trim()) {
      addEmployee(name.trim());
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    if (confirm("Yakin ingin menghapus karyawan ini?")) {
      removeEmployee(employeeId);
    }
  };

  const hasValidationErrors = validationErrors.length > 0;
  const totalFilledShifts = Object.values(schedule).reduce(
    (acc, employeeSchedule) =>
      acc +
      Object.values(employeeSchedule).filter(
        (shift) => shift !== "OFF" && shift !== "CT",
      ).length,
    0,
  );

  const handleSeedData = () => {
    reseedSchedule(seedCount);
  };

  const canEdit = role === "pm";
  const titleRole = role === "pm" ? "PM Module" : "Agent Module";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,#1e293b_0%,transparent_42%),radial-gradient(circle_at_85%_0%,#0f172a_0%,transparent_36%),linear-gradient(140deg,#020617_0%,#111827_52%,#0b1220_100%)] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-700/70 bg-slate-900/80 backdrop-blur supports-backdrop-filter:bg-slate-900/70">
        <div className="mx-auto max-w-375 px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                  {titleRole}
                </p>
                <h1 className="text-3xl font-bold text-slate-100">
                  Simulation Schedule
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={month.toString()}
                  onValueChange={(val) => setMonth(parseInt(val, 10))}
                >
                  <SelectTrigger className="w-37.5 border-slate-600 bg-slate-800 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((monthLabel, index) => (
                      <SelectItem
                        key={monthLabel}
                        value={(index + 1).toString()}
                      >
                        {monthLabel} {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={year.toString()}
                  onValueChange={(val) => setYear(parseInt(val, 10))}
                >
                  <SelectTrigger className="w-27.5 border-slate-600 bg-slate-800 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2025, 2026, 2027].map((itemYear) => (
                      <SelectItem key={itemYear} value={itemYear.toString()}>
                        {itemYear}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {canEdit && (
                  <Button
                    onClick={handleAddEmployee}
                    className="gap-2 bg-sky-600 hover:bg-sky-500"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Karyawan
                  </Button>
                )}
                {onLogout && (
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <Card className="border-emerald-500/30 bg-emerald-900/20">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-emerald-300">Total Karyawan</p>
                    <p className="text-2xl font-bold text-emerald-100">
                      {employees.length}
                    </p>
                  </div>
                  <Users className="h-7 w-7 text-emerald-300" />
                </CardContent>
              </Card>

              <Card className="border-sky-500/30 bg-sky-900/20">
                <CardContent className="p-4">
                  <p className="text-sm text-sky-300">Periode</p>
                  <p className="text-2xl font-bold text-sky-100">
                    {months[month - 1]}
                  </p>
                  <p className="text-xs text-sky-300">{daysInMonth} hari</p>
                </CardContent>
              </Card>

              <Card className="border-amber-500/30 bg-amber-900/20">
                <CardContent className="p-4">
                  <p className="text-sm text-amber-300">Shift Aktif</p>
                  <p className="text-2xl font-bold text-amber-100">
                    {totalFilledShifts}
                  </p>
                  <p className="text-xs text-amber-300">Tidak termasuk OFF</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-900/70">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-300">Seeding Data</p>
                    <Database className="h-4 w-4 text-slate-400" />
                  </div>
                  <Select
                    value={seedCount.toString()}
                    onValueChange={(val) => setSeedCount(parseInt(val, 10))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="h-8 border-slate-600 bg-slate-800 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[20].map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} karyawan
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSeedData}
                      size="sm"
                      className="h-8 flex-1 gap-1"
                      disabled={!canEdit}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Seed
                    </Button>
                    <Button
                      onClick={clearSchedule}
                      size="sm"
                      variant="outline"
                      className="h-8 flex-1"
                      disabled={!canEdit}
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-375 px-4 py-6 md:px-6">
        {hasValidationErrors && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Validasi Error:</div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-4 mb-6">
          <SummaryPanel
            schedule={schedule}
            employees={employees}
            daysInMonth={daysInMonth}
            month={month}
            year={year}
          />
        </div>

        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-100">
              Jadwal Shift - {months[month - 1]} {year}
              <span className="ml-2 text-sm font-medium text-slate-400">
                (Seed v{seedVersion})
              </span>
            </h2>
          </div>
          <div className="p-6 pt-4">
            <ScheduleTable
              schedule={schedule}
              employees={employees}
              daysInMonth={daysInMonth}
              onUpdateShift={updateShift}
              onRemoveEmployee={handleRemoveEmployee}
              readOnly={!canEdit}
            />
          </div>
        </Card>
      </main>
    </div>
  );
}
