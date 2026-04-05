"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BriefcaseBusiness } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { verifyCredentials } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("admin1@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("tcid_auth");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { role?: "pm" };
      if (parsed.role === "pm") {
        router.replace("/pm");
      }
    } catch {
      localStorage.removeItem("tcid_auth");
    }
  }, [router]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = verifyCredentials(email.trim(), password);
    if (!result) {
      setError("Email atau password salah. Gunakan akun demo yang tersedia.");
      return;
    }

    localStorage.setItem(
      "tcid_auth",
      JSON.stringify({
        email: result.email,
        role: result.role,
        loginAt: new Date().toISOString(),
      }),
    );

    router.replace("/pm");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#1d4ed8_0%,transparent_30%),radial-gradient(circle_at_80%_0%,#0f766e_0%,transparent_34%),linear-gradient(130deg,#020617_0%,#111827_55%,#0f172a_100%)]">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10 md:px-6">
        <div className="grid w-full gap-6 md:grid-cols-2">
          <Card className="border-slate-700/80 bg-slate-900/80 backdrop-blur">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                TCID Workforce
              </p>
              <CardTitle className="text-3xl leading-tight text-slate-100">
                Login
              </CardTitle>
              <p className="text-sm text-slate-400">
                Masuk sebagai PM untuk mengakses modul manajemen jadwal.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={onSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="admin1@gmail.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full bg-sky-600 text-white hover:bg-sky-500"
                >
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-emerald-500/30 bg-emerald-900/20">
              <CardContent className="flex items-start gap-3 p-5">
                <BriefcaseBusiness className="mt-1 h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-emerald-100">
                    PM Demo
                  </p>
                  <p className="text-sm text-emerald-200">
                    Email: admin1@gmail.com
                  </p>
                  <p className="text-sm text-emerald-200">Password: admin123</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900/70">
              <CardContent className="p-5 text-sm text-slate-300">
                Halaman ini meniru entry point aplikasi Workforce Management.
                Setelah login, pengguna diarahkan ke dashboard jadwal
                berdasarkan perannya.
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
