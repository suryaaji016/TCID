"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePMData } from "@/hooks/usePMData";
import { City } from "@/lib/pmData";
import { toast } from "sonner";

const CITIES: City[] = ["Jakarta", "Jogja", "Semarang"];

function makeSeats(prefix: string, count: number) {
  return Array.from(
    { length: count },
    (_, i) => `${prefix}-${String(i + 1).padStart(2, "0")}`,
  );
}

const SEAT_MAP: Record<City, string[]> = {
  Jakarta: makeSeats("JAK", 20),
  Jogja: makeSeats("JOG", 20),
  Semarang: makeSeats("SEM", 20),
};

export default function PMSeatsPage() {
  const [city, setCity] = useState<City>("Jakarta");
  const { agents, seatsByCity, assignSeat, clearSeatsByCity } = usePMData({
    month: 4,
    year: 2026,
    daysInMonth: 30,
  });

  const seats = SEAT_MAP[city];
  const bookedCount = useMemo(
    () => seats.filter((s) => seatsByCity[city][s]).length,
    [city, seats, seatsByCity],
  );

  return (
    <div className="space-y-3 text-slate-100">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-3">
          <div className="text-sm text-slate-400">Seat Available</div>
          <div className="text-4xl font-bold text-[#059669]">
            {seats.length - bookedCount}
          </div>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-3">
          <div className="text-sm text-slate-400">Seat Booked</div>
          <div className="text-4xl font-bold text-[#dc2626]">{bookedCount}</div>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-800/80 p-3">
          <div className="text-sm text-slate-400">Seat Terseleksi</div>
          <div className="text-4xl font-bold text-slate-100">Belum dipilih</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1 rounded-md bg-slate-800 p-1">
            {CITIES.map((item) => (
              <button
                key={item}
                onClick={() => setCity(item)}
                className={`rounded-md px-3 py-1 text-sm ${item === city ? "bg-sky-500/25 text-sky-100" : "text-slate-300 hover:bg-slate-700"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="h-8 text-xs"
            onClick={() => {
              clearSeatsByCity(city);
              toast.success(`Semua seat ${city} berhasil dikosongkan.`);
            }}
          >
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {seats.map((seat) => {
            const agentId = seatsByCity[city][seat];
            const agent = agents.find((item) => item.id === agentId);
            const booked = Boolean(agentId);
            return (
              <div
                key={seat}
                className={`rounded-md border p-2 ${
                  booked
                    ? "border-rose-500/40 bg-rose-900/20"
                    : "border-emerald-500/40 bg-emerald-900/20"
                }`}
              >
                <div
                  className={`text-xs font-semibold ${booked ? "text-rose-300" : "text-emerald-300"}`}
                >
                  {seat}
                </div>
                <div className="mt-1 text-[11px] text-slate-300">
                  {agent?.name.toLowerCase().replace(" ", "") || "-"}
                </div>
                <Select
                  value={agentId || "none"}
                  onValueChange={(value) => {
                    assignSeat(city, seat, value === "none" ? null : value);
                    toast.success(`Seat ${seat} berhasil diperbarui.`);
                  }}
                >
                  <SelectTrigger className="mt-1 h-6 border-slate-600 bg-slate-800 text-[10px] text-slate-100">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Belum ada</SelectItem>
                    {agents.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name.toLowerCase().replace(" ", "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
