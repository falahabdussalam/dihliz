"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import { toast } from "sonner";
import { BsEye, BsEyeSlash } from "react-icons/bs";

export default function Login() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState(false)

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      toast.error("Your session expired. Please sign in again.");
    }
  }, [searchParams]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message ?? "Unable to sign in.");
        return;
      }

      const nextParam = searchParams.get("next");
      const nextPath =
        nextParam?.startsWith("/") && !nextParam?.startsWith("//")
          ? nextParam
          : "/dashboard";
      window.location.assign(nextPath);
    } catch {
      toast.error("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_35px_-8px_rgba(0,20,30,0.12),0_8px_18px_-6px_rgba(0,0,0,0.05)]">
        {/* LEFT PANEL – Executive Branding */}
        <section className="relative hidden w-1/2 flex-col justify-between bg-[#0a1c2f] p-12 text-white lg:flex">
          {/* subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />

          <div className="relative z-10">
            <img
              src="/img/top.png"
              alt="Dihliz World School"
              className="h-12 w-fit rounded-lg bg-white px-4 py-1.5 shadow-sm"
            />
          </div>

          <div className="relative z-10 max-w-md">
            <h1 className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              One platform. Endless possibilities.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/80">
              Academics, attendance, and administration.
            </p>
          </div>

          <p className="relative z-10 text-xs tracking-wide text-slate-400/80">
            Dihliz World School
          </p>
        </section>

        {/* RIGHT PANEL – Login Form */}
        <section className="flex w-full flex-col justify-center p-8 sm:p-12 lg:w-1/2">
          {/* Mobile logo */}
          <img
            src="/img/top.png"
            alt="Dihliz World School"
            className="mx-auto mb-8 h-12 w-fit rounded-lg border border-slate-100 bg-white px-3 py-1.5 shadow-sm lg:hidden"
          />

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-[#0a1c2f] sm:text-3xl">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to access your dashboard.
            </p>
          </div>

          {/* {error && (
            <div className="mb-7 flex items-center gap-2 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              <span aria-hidden>⚠️</span>
              {error}
            </div>
          )} */}

          <form onSubmit={submit} className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[0.8rem] font-semibold tracking-tight text-slate-700">
                Email address
              </span>
              <span className="flex items-center rounded-lg border-[1.5px] border-slate-200 bg-white px-4 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10">
                <FiMail className="shrink-0 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent px-3 py-3.5 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                  placeholder="name@dihlizworldschool.com"
                />
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[0.8rem] font-semibold tracking-tight text-slate-700">
                Password
              </span>
              <span className="flex items-center rounded-lg border-[1.5px] border-slate-200 bg-white px-4 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10">
                <FiLock className="shrink-0 text-slate-400" size={18} />
                <input
                  type={view ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent px-3 py-3.5 text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                  placeholder="Enter your password"
                />
                <span onClick={()=>setView(!view)}>{view ? <BsEye/> : <BsEyeSlash/> }</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="group mt-1 flex w-full items-center justify-center gap-2.5 rounded-lg bg-emerald-700 px-4 py-3.5 text-sm font-bold tracking-tight text-white shadow-[0_6px_14px_-4px_rgba(14,107,75,0.35)] transition hover:bg-emerald-800 hover:shadow-[0_10px_18px_-6px_rgba(14,107,75,0.4)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 disabled:shadow-none"
            >
              {submitting ? "Signing in..." : "Sign in"}
              {!submitting && (
                <FiArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}