"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LayoutDashboard, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PMShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/pm", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pm/seats", label: "Seat Mapping", icon: MapPin },
  { href: "/pm/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/pm/agents", label: "Agents", icon: Users },
];

export default function PMShell({ children }: PMShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("tcid_auth");
    router.replace("/");
  };

  return (
    <div className="pm-app min-h-screen bg-[radial-gradient(circle_at_12%_18%,#1f2937_0%,transparent_42%),radial-gradient(circle_at_85%_0%,#0f172a_0%,transparent_36%),linear-gradient(150deg,#020617_0%,#111827_55%,#0b1220_100%)] text-slate-100">
      <div className="mx-auto min-h-screen max-w-400 border-x border-slate-700/70 bg-slate-900/70 backdrop-blur">
        <header className="border-b border-slate-700/70 bg-slate-950/60 px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold leading-tight text-slate-100">
                  PM Console
                </h2>
                <p className="text-sm text-slate-400">
                  Project Manager Console
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 lg:justify-center">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/40"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-between gap-3">
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-100">PM Admin</p>
                <p className="text-sm text-slate-400">admin1@gmail.com</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-8 rounded-md border-slate-600 bg-slate-800 text-xs text-slate-100 hover:bg-slate-700"
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="h-8 rounded-md border-slate-600 bg-slate-800 text-xs text-slate-100 hover:bg-slate-700"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <section className="px-4 py-6 text-slate-100 md:px-6">
          <div className="mb-4">
            <h1 className="text-4xl font-semibold leading-tight text-slate-100">
              Project Manager Console
            </h1>
            <p className="text-base text-slate-400">
              Semi otomatis schedule, seat mapping, dan manajemen akun agent.
            </p>
          </div>

          {children}
        </section>
      </div>
    </div>
  );
}
