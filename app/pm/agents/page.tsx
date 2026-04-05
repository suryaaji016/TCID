"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePMData } from "@/hooks/usePMData";
import { toast } from "sonner";

export default function PMAgentsPage() {
  const { agents, seatLookup, addAgent, updateAgent, removeAgent } = usePMData({
    month: 4,
    year: 2026,
    daysInMonth: 30,
  });

  const rows = useMemo(
    () =>
      [...agents].reverse().map((emp) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        password: emp.password,
        english: emp.english,
        seat: seatLookup[emp.id] || "Belum ada",
      })),
    [agents, seatLookup],
  );

  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentEmail, setNewAgentEmail] = useState("");
  const [newAgentPassword, setNewAgentPassword] = useState("agent123");
  const [newAgentEnglish, setNewAgentEnglish] = useState(false);

  const handleAddAgent = () => {
    if (!newAgentName.trim() || !newAgentEmail.trim()) {
      toast.error("Nama dan email wajib diisi.");
      return;
    }

    if (
      agents.some(
        (agent) =>
          agent.email.toLowerCase() === newAgentEmail.trim().toLowerCase(),
      )
    ) {
      toast.error("Email agent sudah digunakan.");
      return;
    }

    addAgent({
      name: newAgentName.trim(),
      email: newAgentEmail.trim().toLowerCase(),
      password: newAgentPassword || "agent123",
      english: newAgentEnglish,
    });

    setNewAgentName("");
    setNewAgentEmail("");
    setNewAgentPassword("agent123");
    setNewAgentEnglish(false);
    toast.success("Agent baru berhasil ditambahkan.");
  };

  const handleDeleteOne = (id: string, name: string) => {
    removeAgent(id);
    toast.success(`Agent ${name} berhasil dihapus.`);
  };

  const handleSaveAll = () => {
    toast.success("Semua perubahan agent berhasil disimpan.");
  };

  return (
    <div className="space-y-3 text-slate-100">
      <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <h2 className="text-3xl font-semibold text-slate-100">
          Tambah Agent Baru
        </h2>
        <div className="mt-2 grid grid-cols-4 gap-2">
          <Input
            placeholder="Nama"
            value={newAgentName}
            onChange={(e) => setNewAgentName(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={newAgentEmail}
            onChange={(e) => setNewAgentEmail(e.target.value)}
          />
          <Input
            value={newAgentPassword}
            onChange={(e) => setNewAgentPassword(e.target.value)}
          />
          <label className="flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-3 text-sm text-slate-200">
            <Checkbox
              checked={newAgentEnglish}
              onCheckedChange={(checked) =>
                setNewAgentEnglish(checked === true)
              }
            />
            English Speaker
          </label>
        </div>
        <Button className="mt-2 h-8 text-xs" onClick={handleAddAgent}>
          Buat Akun
        </Button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <h2 className="text-3xl font-semibold text-slate-100">
          Edit Akun Agent
        </h2>
        <Button className="mt-2 h-8 text-xs" onClick={handleSaveAll}>
          Save All Agent
        </Button>

        <table className="mt-3 w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-left text-sm text-slate-300">
              <th className="py-2">Nama</th>
              <th className="py-2">Email</th>
              <th className="py-2">Password</th>
              <th className="py-2">English</th>
              <th className="py-2">Seat</th>
              <th className="py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-700/80">
                <td className="py-1 pr-2">
                  <Input
                    className="h-7"
                    value={row.name}
                    onChange={(e) =>
                      updateAgent(row.id, { name: e.target.value })
                    }
                  />
                </td>
                <td className="py-1 pr-2">
                  <Input
                    className="h-7"
                    value={row.email}
                    onChange={(e) =>
                      updateAgent(row.id, { email: e.target.value })
                    }
                  />
                </td>
                <td className="py-1 pr-2">
                  <Input
                    className="h-7"
                    value={row.password}
                    onChange={(e) =>
                      updateAgent(row.id, { password: e.target.value })
                    }
                  />
                </td>
                <td className="py-1 pr-2">
                  <Checkbox
                    checked={row.english}
                    onCheckedChange={(checked) =>
                      updateAgent(row.id, { english: checked === true })
                    }
                  />
                </td>
                <td className="py-1 pr-2 text-sm">{row.seat}</td>
                <td className="py-1">
                  <Button
                    className="h-7 bg-rose-600 text-xs text-white hover:bg-rose-500"
                    onClick={() => handleDeleteOne(row.id, row.name)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
