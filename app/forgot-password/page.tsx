"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setServerError(json.message || "Something went wrong");
        return;
      }
      setSent(true);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-900/40 border border-blue-700/40 mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        {sent ? (
          <div className="p-6 rounded-2xl bg-green-950/40 border border-green-800/40 text-center">
            <svg className="w-10 h-10 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-green-300 font-medium">Check your email</p>
            <p className="text-slate-400 text-sm mt-1">
              If that address is registered, a reset link has been sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-sm">
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input type="email" placeholder="you@example.com" autoComplete="email" {...register("email")}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                  ${errors.email ? "border-red-500/70" : "border-slate-700 hover:border-slate-600"}`} />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
              {isSubmitting ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>Sending...</>
              ) : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">← Back to sign in</a>
        </p>
      </div>
    </div>
  );
}
