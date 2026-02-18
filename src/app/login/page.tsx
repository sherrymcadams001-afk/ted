"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, LogIn, Briefcase, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"personal" | "corporate">("personal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Try again or create an account.");
      } else {
        // Fetch session to determine role-based redirect
        const sessionRes = await fetch("/api/auth/session");
        const sess = await sessionRes.json().catch(() => null);
        const dest = sess?.user?.role === "admin" ? "/admin" : "/dashboard";
        router.push(dest);
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
            Good to see you again!
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ivory/40">
            Sign in to manage your celebrations, track your orders, and chat
            directly with our concierge team. Whether you&apos;re planning a
            boardroom breakfast or a birthday surprise — we&apos;re ready when
            you are.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-gold/10" />
            <span className="text-[10px] uppercase tracking-wider text-gold/40">
              Abuja&apos;s finest
            </span>
            <div className="h-px flex-1 bg-gold/10" />
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full max-w-sm lg:max-w-md">
          {/* Mobile header */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="font-serif text-3xl font-bold text-gold">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-ivory/40">
              Sign in to your Tedlyns account
            </p>
          </div>

          {/* Desktop header */}
          <div className="mb-6 hidden lg:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60">
              Sign In
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ivory">
              Your Account
            </h2>
          </div>

          {/* Login Type Selector */}
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => setLoginType("personal")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-xs font-medium transition-all",
                loginType === "personal"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-gold/10 text-ivory/40 hover:border-gold/20"
              )}
            >
              <User size={14} />
              Personal / Family
            </button>
            <button
              type="button"
              onClick={() => setLoginType("corporate")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-xs font-medium transition-all",
                loginType === "corporate"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-gold/10 text-ivory/40 hover:border-gold/20"
              )}
            >
              <Briefcase size={14} />
              Corporate
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-ivory/50">
                {loginType === "corporate" ? "Work Email" : "Email Address"}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={
                  loginType === "corporate"
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
                  placeholder="••••••••"
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={16} />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-ivory/30">
            New here?{" "}
            <Link href="/register" className="text-gold hover:text-gold-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
