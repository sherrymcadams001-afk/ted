"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, UserPlus, Briefcase, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"private" | "enterprise">("private");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, company: company || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created! But auto sign-in failed — please log in manually.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-20">
        {/* Left: Welcome text (desktop only) */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:py-16">
          <h1 className="font-serif text-4xl font-bold text-ivory">
            Join the Tedlyns family
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ivory/40">
            Whether you&apos;re managing corporate events or planning a
            birthday surprise for someone special — your Tedlyns account
            gives you direct access to our concierge, birthday vault, and
            curated offerings. Let&apos;s make something memorable together.
          </p>
          <div className="mt-8 rounded-xl border border-gold/10 bg-gold/[0.03] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-gold/60 mb-2">
              Why create an account?
            </p>
            <ul className="space-y-2 text-sm text-ivory/40">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/40" />
                Chat directly with our concierge team
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/40" />
                Save birthdays and never miss a celebration
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/40" />
                Get personalised recommendations
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/40" />
                Corporate accounts get standing order access
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Register Form */}
        <div className="w-full max-w-sm lg:max-w-md">
          {/* Mobile header */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="font-serif text-3xl font-bold text-gold">
              Join Tedlyns
            </h1>
            <p className="mt-2 text-sm text-ivory/40">
              Create your account — it takes 30 seconds
            </p>
          </div>

          {/* Desktop header */}
          <div className="mb-6 hidden lg:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60">
              Get Started
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ivory">
              Create Your Account
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Role Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("private")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-xs font-medium transition-all",
                  role === "private"
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-gold/10 text-ivory/40 hover:border-gold/20"
                )}
              >
                <User size={14} />
                Personal / Family
              </button>
              <button
                type="button"
                onClick={() => setRole("enterprise")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-xs font-medium transition-all",
                  role === "enterprise"
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-gold/10 text-ivory/40 hover:border-gold/20"
                )}
              >
                <Briefcase size={14} />
                Corporate
              </button>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-ivory/50">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Amina Ibrahim"
                className={cn(
                  "h-12 rounded-lg border bg-transparent px-4 text-sm text-ivory",
                  "border-gold/15 placeholder:text-ivory/20",
                  "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20",
                  "transition-colors"
                )}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-ivory/50">
                {role === "enterprise" ? "Work Email" : "Email Address"}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={
                  role === "enterprise"
                    ? "you@company.com"
                    : "you@example.com"
                }
                className={cn(
                  "h-12 rounded-lg border bg-transparent px-4 text-sm text-ivory",
                  "border-gold/15 placeholder:text-ivory/20",
                  "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20",
                  "transition-colors"
                )}
              />
            </div>

            {/* Company (enterprise only) */}
            {role === "enterprise" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="company"
                  className="text-xs font-medium text-ivory/50"
                >
                  Company / Organisation
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Dangote Group"
                  className={cn(
                    "h-12 rounded-lg border bg-transparent px-4 text-sm text-ivory",
                    "border-gold/15 placeholder:text-ivory/20",
                    "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20",
                    "transition-colors"
                  )}
                />
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-ivory/50"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className={cn(
                    "h-12 w-full rounded-lg border bg-transparent px-4 pr-10 text-sm text-ivory",
                    "border-gold/15 placeholder:text-ivory/20",
                    "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20",
                    "transition-colors"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-burgundy-300">{error}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
                  Creating your account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={16} />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-ivory/30">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-gold-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
