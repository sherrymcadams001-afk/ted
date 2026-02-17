"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Cake,
  Plus,
  Trash2,
  LogOut,
  CalendarDays,
  Users,
  Briefcase,
  Gift,
  X,
} from "lucide-react";

type BirthdayEvent = {
  id: string;
  name: string;
  date: string;
  type: "corporate" | "family";
  relationship: string;
  status: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<"corporate" | "family">("family");
  const [formRelationship, setFormRelationship] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status, router, fetchEvents]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          date: formDate,
          type: formType,
          relationship: formRelationship,
        }),
      });
      if (res.ok) {
        setFormName("");
        setFormDate("");
        setFormType("family");
        setFormRelationship("");
        setShowForm(false);
        fetchEvents();
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      }
    } catch {
      // silent fail
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  const isEnterprise = session.user.role === "enterprise";
  const upcomingEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const nextEvent = upcomingEvents.find(
    (ev) => new Date(ev.date) >= new Date()
  );

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:py-14">
      {/* Greeting */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/60">
            {isEnterprise ? "Enterprise" : "Private"} Account
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-ivory">
            Hello, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ivory/40">
            {isEnterprise ? "Staff Birthday Registry" : "My Family Vault"}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 text-xs text-ivory/30 hover:text-burgundy-300 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gold/10 bg-gold/[0.03] p-4 text-center">
          <CalendarDays size={18} className="mx-auto mb-1 text-gold/50" />
          <p className="text-xl font-bold text-ivory tabular-nums">
            {events.length}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ivory/30">
            Celebrations
          </p>
        </div>
        <div className="rounded-xl border border-gold/10 bg-gold/[0.03] p-4 text-center">
          <Gift size={18} className="mx-auto mb-1 text-teal/50" />
          <p className="text-xl font-bold text-ivory tabular-nums">
            {events.filter((e) => new Date(e.date) >= new Date()).length}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ivory/30">
            Upcoming
          </p>
        </div>
        <div className="rounded-xl border border-gold/10 bg-gold/[0.03] p-4 text-center">
          {isEnterprise ? (
            <Briefcase size={18} className="mx-auto mb-1 text-burgundy/50" />
          ) : (
            <Users size={18} className="mx-auto mb-1 text-burgundy/50" />
          )}
          <p className="text-xl font-bold text-ivory tabular-nums">
            {new Set(events.map((e) => e.relationship)).size}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ivory/30">
            {isEnterprise ? "Departments" : "Relations"}
          </p>
        </div>
      </div>

      {/* Next Celebration Card */}
      {nextEvent && (
        <div className="mb-6 rounded-xl border border-gold/20 bg-gradient-to-r from-gold/[0.06] to-transparent p-4">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-gold/50">
            Next Celebration
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-ivory">{nextEvent.name}</p>
              <p className="text-xs text-ivory/40">
                {new Date(nextEvent.date).toLocaleDateString("en-NG", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
                {" · "}
                {nextEvent.relationship}
              </p>
            </div>
            <Cake className="text-gold/40" size={28} />
          </div>
        </div>
      )}

      {/* Add Event Button  */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg text-ivory/80">
          {isEnterprise ? "Staff Registry" : "Family Vault"}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="gap-1.5"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "Add"}
        </Button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <form
          onSubmit={handleAddEvent}
          className="mb-6 flex flex-col gap-3 rounded-xl border border-gold/15 bg-gold/[0.02] p-4"
        >
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
          <input
            type="text"
            value={formRelationship}
            onChange={(e) => setFormRelationship(e.target.value)}
            required
            placeholder={
              isEnterprise
                ? "Department (e.g. Engineering)"
                : "Relationship (e.g. Spouse)"
            }
            className={cn(
              "h-10 rounded-lg border bg-transparent px-3 text-sm text-ivory",
              "border-gold/15 placeholder:text-ivory/20",
              "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
            )}
          />
          <Button type="submit" disabled={saving} className="h-10">
            {saving ? "Saving..." : "Save Celebration"}
          </Button>
        </form>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gold/10 py-16 text-center">
          <Cake size={32} className="mb-3 text-gold/20" />
          <p className="text-sm text-ivory/30">No celebrations yet</p>
          <p className="mt-1 text-xs text-ivory/15">
            Tap &quot;Add&quot; to register your first birthday
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {upcomingEvents.map((event) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            return (
              <div
                key={event.id}
                className={cn(
                  "group flex items-center justify-between rounded-xl border p-4 transition-all",
                  isPast
                    ? "border-ivory/5 bg-ivory/[0.02]"
                    : "border-gold/10 bg-gold/[0.02]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold",
                      isPast
                        ? "bg-ivory/5 text-ivory/20"
                        : "bg-gold/10 text-gold"
                    )}
                  >
                    {eventDate.toLocaleDateString("en", { day: "2-digit" })}
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isPast ? "text-ivory/30" : "text-ivory"
                      )}
                    >
                      {event.name}
                    </p>
                    <p className="text-xs text-ivory/30">
                      {eventDate.toLocaleDateString("en-NG", {
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {event.relationship}
                      <span
                        className={cn(
                          "ml-1.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] uppercase",
                          event.type === "corporate"
                            ? "bg-teal/10 text-teal"
                            : "bg-burgundy/10 text-burgundy-300"
                        )}
                      >
                        {event.type}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-ivory/10 hover:text-burgundy-300 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
