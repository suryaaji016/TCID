"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScheduleDashboard from "@/components/ScheduleDashboard";

export default function AgentSchedulePage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("tcid_auth");
    if (!raw) {
      router.replace("/");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { role?: "pm" | "agent" };
      if (parsed.role !== "agent") {
        router.replace("/");
        return;
      }

      setAllowed(true);
    } catch {
      localStorage.removeItem("tcid_auth");
      router.replace("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("tcid_auth");
    router.replace("/");
  };

  if (!allowed) {
    return null;
  }

  return <ScheduleDashboard role="agent" onLogout={handleLogout} />;
}
