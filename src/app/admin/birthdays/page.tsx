"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Cake, Plus, Search, Trash2, X } from "lucide-react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: string;
};

type AdminEvent = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  name: string;
  date: string;
  type: "corporate" | "family";
  relationship: string | null;
  status: string;
};

export default function AdminBirthdaysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);

  // form
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<"corporate" | "family">("family");
  const [formRelationship, setFormRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [usersRes, eventsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/events"),
      ]);

      if (usersRes.status === 403 || eventsRes.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!usersRes.ok || !eventsRes.ok) {
        setError("Could not load birthdays");
        return;
      }

      const usersData = await usersRes.json();
      const eventsData = await eventsRes.json();

      setUsers(usersData.users as AdminUser[]);
      setEvents(eventsData.events as AdminEvent[]);

      if (!selectedUserId && (usersData.users?.length ?? 0) > 0) {
        setSelectedUserId(usersData.users[0].id);
      }
    } catch {
      setError("Could not load birthdays");
    } finally {
      setLoading(false);
    }
  }, [router, selectedUserId]);

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
      loadData();
    }
  }, [status, session, router, loadData]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const now = new Date();
    const base = showUpcomingOnly
      ? sorted.filter((e) => {
          const [year, month, day] = e.date.split("-").map(Number);
          if (!year || !month || !day) return false;

          const thisYear = new Date(now.getFullYear(), month - 1, day);
          const diffDays =
            (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 7;
        })
      : sorted;

    if (!q) return base;
    return base.filter((e) => {
      const haystack = [
        e.name,
        e.relationship ?? "",
        e.userName ?? "",
        e.userEmail ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [events, query, showUpcomingOnly]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          name: formName,
          date: formDate,
          type: formType,
          relationship: formRelationship,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not save birthday");
        return;
      }

      setFormName("");
      setFormDate("");
      setFormType("family");
      setFormRelationship("");
      setShowForm(false);
      await loadData();
    } catch {
      setError("Could not save birthday");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      // silent fail
    }
  };

  const onDeleteUser = async (userId: string) => {
    setError(null);

    const user = users.find((u) => u.id === userId);
    const label = user ? `${user.name} (${user.email})` : userId;

    if (userId === session?.user?.id) {
      setError("You cannot delete your own account");
      return;
    }

    if (!window.confirm(`Delete user ${label}? This will remove their birthdays and conversations.`)) {
      return;
    }

    setDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not delete user");
        return;
      }

      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== userId);
        setSelectedUserId((current) => (current === userId ? (next[0]?.id ?? "") : current));
        return next;
      });
      setEvents((prev) => prev.filter((e) => e.userId !== userId));
    } catch {
      setError("Could not delete user");
    } finally {
      setDeletingUser(false);
    }
  };

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
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <Cake size={14} className="text-gold/60" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60">
            Admin
          </p>
        </div>
        <h1 className="font-serif text-2xl font-bold text-ivory md:text-3xl">
          Birthdays
        </h1>
        <p className="mt-1 text-sm text-ivory/40">
          Add and manage client birthdays across all accounts.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by person or client..."
            className={cn(
              "h-10 w-full rounded-lg border bg-transparent pl-9 pr-3 text-sm text-ivory",
              "border-gold/15 placeholder:text-ivory/20",
              "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
            )}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-1.5"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "Add Birthday"}
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex rounded-lg border border-gold/15 bg-gold/[0.02] p-1">
          <button
            type="button"
            onClick={() => setShowUpcomingOnly(true)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs transition-colors",
              showUpcomingOnly
                ? "bg-gold/10 text-gold"
                : "text-ivory/40 hover:text-ivory/70"
            )}
          >
            Upcoming (7 days)
          </button>
          <button
            type="button"
            onClick={() => setShowUpcomingOnly(false)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs transition-colors",
              !showUpcomingOnly
                ? "bg-gold/10 text-gold"
                : "text-ivory/40 hover:text-ivory/70"
            )}
          >
            All
          </button>
        </div>
        <p className="text-xs text-ivory/30 whitespace-nowrap">
          {filteredEvents.length} shown
        </p>
      </div>

      {showForm && (
        <form
          onSubmit={onAdd}
          className="mb-6 flex flex-col gap-3 rounded-xl border border-gold/15 bg-gold/[0.02] p-4"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={cn(
                  "h-10 flex-1 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                  "border-gold/15",
                  "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
                )}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-black">
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!selectedUserId || deletingUser || selectedUserId === session?.user?.id}
                onClick={() => onDeleteUser(selectedUserId)}
                title="Delete user"
              >
                <Trash2 size={14} />
              </Button>
            </div>

            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              placeholder="Person's name"
              className={cn(
                "h-10 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                "border-gold/15 placeholder:text-ivory/20",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
              )}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
              className={cn(
                "h-10 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                "border-gold/15",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20",
                "[color-scheme:dark]"
              )}
            />

            <input
              type="text"
              value={formRelationship}
              onChange={(e) => setFormRelationship(e.target.value)}
              required
              placeholder="Relationship / Department"
              className={cn(
                "h-10 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                "border-gold/15 placeholder:text-ivory/20",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
              )}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormType("family")}
              className={cn(
                "flex-1 rounded-lg border py-2 text-xs font-medium transition-all",
                formType === "family"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-gold/10 text-ivory/40"
              )}
            >
              Family
            </button>
            <button
              type="button"
              onClick={() => setFormType("corporate")}
              className={cn(
                "flex-1 rounded-lg border py-2 text-xs font-medium transition-all",
                formType === "corporate"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-gold/10 text-ivory/40"
              )}
            >
              Corporate
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-burgundy/20 bg-burgundy/[0.08] px-3 py-2 text-xs text-burgundy-100">
              {error}
            </div>
          )}

          <Button type="submit" disabled={saving} className="h-10">
            {saving ? "Saving..." : "Save Birthday"}
          </Button>
        </form>
      )}

      {error && !showForm && (
        <div className="mb-6 rounded-lg border border-burgundy/20 bg-burgundy/[0.08] px-3 py-2 text-xs text-burgundy-100">
          {error}
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/10 py-14 text-center">
          <p className="text-sm text-ivory/20">No birthdays found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.date);
            const day = eventDate.toLocaleDateString("en", { day: "2-digit" });
            const monthDay = eventDate.toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={event.id}
                className="group flex items-center justify-between rounded-xl border border-gold/10 bg-gold/[0.02] p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                    {day}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ivory truncate">
                      {event.name}
                      <span className={cn(
                        "ml-2 inline-block rounded-full px-1.5 py-0.5 text-[9px] uppercase",
                        event.type === "corporate"
                          ? "bg-teal/10 text-teal"
                          : "bg-burgundy/10 text-burgundy-300"
                      )}>
                        {event.type}
                      </span>
                    </p>
                    <p className="text-xs text-ivory/30 truncate">
                      {event.relationship ?? ""}
                      {event.userName ? ` · Client: ${event.userName}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-xs text-gold/50 whitespace-nowrap">{monthDay}</p>
                  <button
                    onClick={() => onDelete(event.id)}
                    className="text-ivory/10 hover:text-burgundy-300 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
