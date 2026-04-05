"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PMShell from "@/components/pm/PMShell";

export default function PMLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("tcid_auth");
    if (!raw) {
      router.replace("/");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { role?: "pm" };
      if (parsed.role !== "pm") {
        router.replace("/");
        return;
      }
      setAllowed(true);
    } catch {
      localStorage.removeItem("tcid_auth");
      router.replace("/");
    }
  }, [router]);

  if (!allowed) {
    return null;
  }

  return <PMShell>{children}</PMShell>;
}
