"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarDays,
  MessageSquare,
  Cake,
  Shield,
  Clock,
  ArrowRight,
  Settings,
  Trash2,
} from "lucide-react";

type AdminStats = {
  totalUsers: number;
  totalEvents: number;
  openChats: number;
  upcomingBirthdays: number;
};

type UpcomingBirthday = {
  id: string;
  name: string;
  date: string;
  relationship: string;
  userName: string;
};

type RecentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  createdAt: string;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [birthdays, setBirthdays] = useState<UpcomingBirthday[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setBirthdays(data.upcomingBirthdays);
        setRecentUsers(data.recentUsers);
      } else if (res.status === 403) {
        router.push("/dashboard");
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [router]);

  const onDeleteUser = useCallback(
    async (user: RecentUser) => {
      setError(null);

      if (user.id === session?.user?.id) {
        setError("You cannot delete your own account");
        return;
      }

      if (!window.confirm(`Delete user ${user.name} (${user.email})? This will remove their birthdays and conversations.`)) {
        return;
      }

      setDeletingUserId(user.id);
      try {
        const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
          method: "DELETE",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error ?? "Could not delete user");
          return;
        }
        await fetchData();
      } catch {
        setError("Could not delete user");
      } finally {
        setDeletingUserId(null);
      }
    },
    [fetchData, session?.user?.id]
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      fetchData();
    }
  }, [status, session, router, fetchData]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:py-14 lg:max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-gold/60" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60">
              Admin Panel
            </p>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ivory md:text-3xl">
            The Pass
          </h1>
          <p className="mt-1 text-sm text-ivory/40">
            God Mode — everything happening across Tedlyns, at a glance
          </p>
        </div>
        <Link
          href="/concierge"
          className="flex items-center gap-1.5 rounded-lg border border-gold/15 px-4 py-2 text-xs text-gold hover:bg-gold/5 transition-colors"
        >
          Concierge
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Quick Links */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/admin/site-editor"
          className="flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/[0.06] px-4 py-2 text-xs text-gold hover:bg-gold/10 transition-colors"
        >
          Site Editor
          <Settings size={12} />
        </Link>

        <Link
          href="/admin/curate"
          className="flex items-center gap-1.5 rounded-lg border border-gold/15 px-4 py-2 text-xs text-ivory/60 hover:bg-gold/5 hover:text-gold transition-colors"
        >
          Menu Manager
          <ArrowRight size={12} />
        </Link>

        <Link
          href="/admin/birthdays"
          className="flex items-center gap-1.5 rounded-lg border border-gold/15 px-4 py-2 text-xs text-ivory/60 hover:bg-gold/5 hover:text-gold transition-colors"
        >
          Birthdays
          <ArrowRight size={12} />
        </Link>

        <Link
          href="/admin/profile"
          className="flex items-center gap-1.5 rounded-lg border border-gold/15 px-4 py-2 text-xs text-ivory/60 hover:bg-gold/5 hover:text-gold transition-colors"
        >
          Profile
          <Settings size={12} />
        </Link>
      </div>

      {/* Stats Grid — 4 columns on desktop */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
          {[
            {
              label: "Total Users",
              value: stats.totalUsers,
              icon: Users,
              color: "text-gold",
              bg: "bg-gold/[0.06]",
              border: "border-gold/15",
            },
            {
              label: "Celebrations",
              value: stats.totalEvents,
              icon: CalendarDays,
              color: "text-teal",
              bg: "bg-teal/[0.06]",
              border: "border-teal/15",
            },
            {
              label: "Open Chats",
              value: stats.openChats,
              icon: MessageSquare,
              color: "text-burgundy-300",
              bg: "bg-burgundy/[0.06]",
              border: "border-burgundy/15",
            },
            {
              label: "Upcoming B'days",
              value: stats.upcomingBirthdays,
              icon: Cake,
              color: "text-gold",
              bg: "bg-gold/[0.06]",
              border: "border-gold/15",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-xl border p-4 md:p-5",
                stat.bg,
                stat.border
              )}
            >
              <stat.icon size={16} className={cn("mb-2", stat.color)} />
              <p className="text-2xl font-bold text-ivory tabular-nums md:text-3xl">
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-ivory/30">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Desktop two-column layout for birthdays + users */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
        {/* Upcoming Birthdays */}
        <div className="flex-1">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-ivory/80">
            <Cake size={16} className="text-gold/50" />
            Upcoming Birthdays (7 days)
          </h2>
          {birthdays.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gold/10 py-10 text-center">
              <p className="text-sm text-ivory/20">No upcoming birthdays this week</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {birthdays.map((bday) => (
                <div
                  key={bday.id}
                  className="flex items-center justify-between rounded-xl border border-gold/10 bg-gold/[0.02] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                      {new Date(bday.date).toLocaleDateString("en", {
                        day: "2-digit",
                      })}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ivory">
                        {bday.name}
                      </p>
                      <p className="text-xs text-ivory/30">
                        {bday.relationship} · Client: {bday.userName}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gold/50">
                    {new Date(bday.date).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="flex-1">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-ivory/80">
            <Clock size={16} className="text-teal/50" />
            Recent Signups
          </h2>
          {error && (
            <div className="mb-3 rounded-lg border border-burgundy/20 bg-burgundy/[0.08] px-3 py-2 text-xs text-burgundy-100">
              {error}
            </div>
          )}
          {recentUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gold/10 py-10 text-center">
              <p className="text-sm text-ivory/20">No users yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-ivory/5 bg-ivory/[0.02] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory/5 text-xs font-bold text-ivory/40">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ivory">
                        {user.name}
                      </p>
                      <p className="text-xs text-ivory/30">
                        {user.email}
                        {user.company && ` · ${user.company}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] uppercase",
                        user.role === "enterprise"
                          ? "bg-teal/10 text-teal"
                          : "bg-gold/10 text-gold/60"
                      )}
                    >
                      {user.role}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={deletingUserId === user.id || user.id === session.user.id}
                      onClick={() => onDeleteUser(user)}
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
