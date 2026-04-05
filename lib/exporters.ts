import { PMAgent } from "@/lib/pmData";
import { Schedule } from "@/types/schedule";

function toCsvRow(values: Array<string | number>): string {
  return values
    .map((value) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
    .join(",");
}

export function downloadScheduleCsv(params: {
  year: number;
  month: number;
  daysInMonth: number;
  agents: PMAgent[];
  schedule: Schedule;
}) {
  const { year, month, daysInMonth, agents, schedule } = params;

  const headers = [
    "Agent",
    "NIP",
    "Skill",
    ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
  ];
  const rows = agents.map((agent) => {
    const shifts = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return schedule[agent.id]?.[day] || "OFF";
    });
    return [agent.name, agent.nip, agent.skill, ...shifts];
  });

  const csv = [toCsvRow(headers), ...rows.map((row) => toCsvRow(row))].join(
    "\n",
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `schedule-${year}-${String(month).padStart(2, "0")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
