"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogIn, LogOut, Settings, Calendar, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Admin goes to admin panel by default, but account page still works for everyone
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  // Authenticated — show account overview
  if (session) {
    const isAdmin = session.user?.role === "admin";
    const isEnterprise = session.user?.role === "enterprise";

    return (
      <div className="mx-auto max-w-2xl px-5 py-8 md:py-14 lg:max-w-4xl">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60">
            Your Account
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-ivory md:text-3xl">
            Hey, {session.user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="mt-1 text-sm text-ivory/40">
            {isAdmin
              ? "Admin account — you have the master keys"
              : isEnterprise
                ? "Corporate account"
                : "Personal account"}
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="group flex items-center gap-4 rounded-xl border border-gold/10 bg-gold/[0.02] p-5 transition-all hover:border-gold/25 hover:bg-gold/[0.04]"
            >
              <Shield size={20} className="text-gold/50 group-hover:text-gold" />
              <div>
                <p className="text-sm font-medium text-ivory group-hover:text-gold transition-colors">
                  Admin Dashboard
                </p>
                <p className="text-xs text-ivory/30">Manage everything</p>
              </div>
            </Link>
          )}

          <Link
            href="/dashboard"
            className="group flex items-center gap-4 rounded-xl border border-gold/10 bg-gold/[0.02] p-5 transition-all hover:border-gold/25 hover:bg-gold/[0.04]"
          >
            <Calendar size={20} className="text-gold/50 group-hover:text-gold" />
            <div>
              <p className="text-sm font-medium text-ivory group-hover:text-gold transition-colors">
                My Celebrations
              </p>
              <p className="text-xs text-ivory/30">Birthday vault &amp; events</p>
            </div>
          </Link>

          <Link
            href="/concierge"
            className="group flex items-center gap-4 rounded-xl border border-gold/10 bg-gold/[0.02] p-5 transition-all hover:border-gold/25 hover:bg-gold/[0.04]"
          >
            <MessageCircle size={20} className="text-teal/50 group-hover:text-teal" />
            <div>
              <p className="text-sm font-medium text-ivory group-hover:text-teal transition-colors">
                Chat With Us
              </p>
              <p className="text-xs text-ivory/30">Talk to our concierge</p>
            </div>
          </Link>

          <Link
            href="/curate"
            className="group flex items-center gap-4 rounded-xl border border-gold/10 bg-gold/[0.02] p-5 transition-all hover:border-gold/25 hover:bg-gold/[0.04]"
          >
            <Settings size={20} className="text-ivory/30 group-hover:text-ivory/60" />
            <div>
              <p className="text-sm font-medium text-ivory group-hover:text-gold transition-colors">
                Browse Offerings
              </p>
              <p className="text-xs text-ivory/30">Catering, cakes &amp; gifts</p>
            </div>
          </Link>
        </div>

        {/* Account Info */}
        <div className="mt-8 rounded-xl border border-ivory/5 bg-ivory/[0.02] p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ivory/30">
            Account Details
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ivory/40">Name</span>
              <span className="text-ivory">{session.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ivory/40">Email</span>
              <span className="text-ivory">{session.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ivory/40">Account Type</span>
              <span className="capitalize text-gold">{session.user?.role}</span>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="mt-6 text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-2 text-sm text-ivory/30 hover:text-burgundy-300 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Unauthenticated — show sign-in prompt
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <h1 className="font-serif text-3xl font-bold text-gold md:text-5xl">
          Your Account
        </h1>
        <p className="text-sm text-ivory/40 leading-relaxed">
          Sign in to manage your celebrations, chat with our concierge, and
          explore everything Tedlyns has to offer.
        </p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button className="gap-2">
              <LogIn size={16} />
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
