"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, UserPlus } from "lucide-react";

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
      // Register
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, company: company || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign-in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created, but sign-in failed. Try logging in.");
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
    <div className="flex min-h-[calc(100vh-5rem)] items-end justify-center px-6 pb-24 md:items-center md:pb-0">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-gold">
            Join Tedlyns
          </h1>
          <p className="mt-2 text-sm text-ivory/40">
            Create your account to indulge
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Role Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole("private")}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-xs font-medium transition-all",
                role === "private"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-gold/10 text-ivory/40 hover:border-gold/20"
              )}
            >
              Private / Family
            </button>
            <button
              type="button"
              onClick={() => setRole("enterprise")}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-xs font-medium transition-all",
                role === "enterprise"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-gold/10 text-ivory/40 hover:border-gold/20"
              )}
            >
              Enterprise
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
              placeholder="Jane Doe"
              className={cn(
                "h-11 rounded-lg border bg-transparent px-4 text-sm text-ivory",
                "border-gold/15 placeholder:text-ivory/20",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20",
                "transition-colors"
              )}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-ivory/50">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className={cn(
                "h-11 rounded-lg border bg-transparent px-4 text-sm text-ivory",
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
                Company Name
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Reliance HMO"
                className={cn(
                  "h-11 rounded-lg border bg-transparent px-4 text-sm text-ivory",
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
                placeholder="••••••••"
                className={cn(
                  "h-11 w-full rounded-lg border bg-transparent px-4 pr-10 text-sm text-ivory",
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
            className="mt-2 h-11 w-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
                Creating account...
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
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
