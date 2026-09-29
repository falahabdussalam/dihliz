"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";

export default function Login() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      setError("Your session expired. Please sign in again.");
    }
  }, [searchParams.get("expired")]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? "Unable to sign in.");
        return;
      }

      const nextPath = searchParams.get("next")?.startsWith("/") && !searchParams.get("next")?.startsWith("//")
        ? searchParams.get("next")!
        : "/dashboard";
      window.location.assign(nextPath);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      
      <main className="relative flex min-h-screen overflow-hidden bg-[#071a33]">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />

        <section className="relative z-10 hidden w-1/2 flex-col justify-between p-14 text-white lg:flex">
          <img src="/img/top.png" alt="Dihliz World School" className="h-20 w-fit rounded-xl bg-white p-2" />
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.3em] text-amber-400">Dihliz School ERP</p>
            <h1 className="text-5xl font-extrabold leading-tight">One place for every student, every day, every year.</h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Manage academics, attendance, assessments and 360° reports through a secure academic-year workspace.
            </p>
          </div>
          <p className="text-sm text-slate-400">Dihliz World School · Poonoor</p>
        </section>

        <section className="relative z-10 flex w-full items-center justify-center p-5 lg:w-1/2">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-10">
            <img src="/img/top.png" alt="Dihliz World School" className="mx-auto mb-8 h-16 rounded bg-white p-1 lg:hidden" />
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-amber-600">Secure staff access</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#071a33]">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in with your staff account to open the dashboard.</p>

            {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Email address</span>
                <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <FiMail className="text-slate-400" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                    placeholder="name@dihlizworldschool.com"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
                <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                  <FiLock className="text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
                    placeholder="Enter your password"
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b7a4b] px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#08683f] disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? "Signing in..." : "Open dashboard"}
                {!submitting && <FiArrowRight />}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
