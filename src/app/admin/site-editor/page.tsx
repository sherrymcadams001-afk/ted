"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Save,
  Settings,
  Home,
  Users,
  UtensilsCrossed,
  MessageCircle,
  ArrowLeft,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Code,
} from "lucide-react";
import Link from "next/link";

type ContentRow = {
  key: string;
  value: string;
  type: "text" | "textarea" | "image" | "json";
  label: string;
  page: string;
};

const PAGE_TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "tribe", label: "Tribe", icon: Users },
  { id: "curate", label: "Curate", icon: UtensilsCrossed },
  { id: "footer", label: "Footer", icon: AlignLeft },
  { id: "contact", label: "Contact", icon: MessageCircle },
];

function typeIcon(t: string) {
  switch (t) {
    case "image":
      return ImageIcon;
    case "textarea":
      return AlignLeft;
    case "json":
      return Code;
    default:
      return Type;
  }
}

export default function SiteEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      if (res.status === 403) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({
          type: "err",
          text: data?.error ? String(data.error) : `Failed to load content (HTTP ${res.status})`,
        });
        return;
      }
      setRows(data.content ?? []);
    } catch {
      setMsg({ type: "err", text: "Failed to load content (network error)" });
    } finally {
      setLoading(false);
    }
  }, [router]);

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
      fetchContent();
    }
  }, [status, session, router, fetchContent]);

  const filteredRows = rows.filter((r) => r.page === activeTab);

  const getValue = (key: string, original: string) =>
    dirty[key] !== undefined ? dirty[key] : original;

  const onChange = (key: string, value: string) => {
    setDirty((prev) => ({ ...prev, [key]: value }));
    setMsg(null);
  };

  const onSave = async () => {
    const updates = Object.entries(dirty).map(([key, value]) => ({
      key,
      value,
    }));
    if (updates.length === 0) return;

    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ type: "err", text: data?.error ?? "Could not save" });
        return;
      }
      // Apply dirty values into rows so UI stays in sync
      setRows((prev) =>
        prev.map((r) =>
          dirty[r.key] !== undefined ? { ...r, value: dirty[r.key] } : r
        )
      );
      setDirty({});
      setMsg({ type: "ok", text: `Saved ${updates.length} change${updates.length > 1 ? "s" : ""}` });
    } catch {
      setMsg({ type: "err", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const dirtyCount = Object.keys(dirty).length;

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:py-14 lg:max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-2 flex items-center gap-1 text-xs text-ivory/30 hover:text-gold transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Admin
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={14} className="text-gold/60" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60">
              God Mode
            </p>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ivory md:text-3xl">
            Site Editor
          </h1>
          <p className="mt-1 text-sm text-ivory/40">
            Edit all text, images, and content across every page
          </p>
        </div>
        {dirtyCount > 0 && (
          <Button onClick={onSave} disabled={saving} className="gap-2">
            <Save size={16} />
            {saving
              ? "Saving..."
              : `Save ${dirtyCount} change${dirtyCount > 1 ? "s" : ""}`}
          </Button>
        )}
      </div>

      {/* Page Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gold/10 bg-gold/[0.02] p-1">
        {PAGE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabDirty = Object.keys(dirty).some((k) =>
            rows.find((r) => r.key === k && r.page === tab.id)
          );
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs transition-colors whitespace-nowrap",
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-ivory/40 hover:text-ivory/70"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {tabDirty && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-gold" />
              )}
            </button>
          );
        })}
      </div>

      {/* Status message */}
      {msg && (
        <div
          className={cn(
            "mb-4 rounded-lg border px-3 py-2 text-xs",
            msg.type === "ok"
              ? "border-teal/20 bg-teal/[0.08] text-teal"
              : "border-burgundy/20 bg-burgundy/[0.08] text-burgundy-100"
          )}
        >
          {msg.text}
        </div>
      )}

      {/* Content Fields */}
      {filteredRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/10 py-16 text-center">
          <p className="text-sm text-ivory/20">
            No editable content for this page yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRows.map((row) => {
            const TIcon = typeIcon(row.type);
            const val = getValue(row.key, row.value);
            const isDirty = dirty[row.key] !== undefined;

            return (
              <div
                key={row.key}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  isDirty
                    ? "border-gold/25 bg-gold/[0.04]"
                    : "border-ivory/5 bg-ivory/[0.02]"
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <TIcon size={12} className="text-ivory/20" />
                  <label className="text-xs font-medium text-ivory/60">
                    {row.label}
                  </label>
                  <span className="text-[9px] text-ivory/15 font-mono">
                    {row.key}
                  </span>
                </div>

                {row.type === "textarea" ? (
                  <textarea
                    value={val}
                    onChange={(e) => onChange(row.key, e.target.value)}
                    rows={3}
                    className={cn(
                      "w-full resize-y rounded-lg border bg-transparent px-3 py-2 text-sm text-ivory",
                      "border-gold/10 placeholder:text-ivory/15",
                      "focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/15"
                    )}
                  />
                ) : row.type === "image" ? (
                  <div className="flex items-center gap-3">
                    {val && (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gold/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={val}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="url"
                      value={val}
                      onChange={(e) => onChange(row.key, e.target.value)}
                      placeholder="Image URL"
                      className={cn(
                        "h-10 flex-1 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                        "border-gold/10 placeholder:text-ivory/15",
                        "focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/15"
                      )}
                    />
                  </div>
                ) : row.type === "json" ? (
                  <textarea
                    value={val}
                    onChange={(e) => onChange(row.key, e.target.value)}
                    rows={4}
                    className={cn(
                      "w-full resize-y rounded-lg border bg-transparent px-3 py-2 font-mono text-xs text-ivory",
                      "border-gold/10 placeholder:text-ivory/15",
                      "focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/15"
                    )}
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onChange(row.key, e.target.value)}
                    className={cn(
                      "h-10 w-full rounded-lg border bg-transparent px-3 text-sm text-ivory",
                      "border-gold/10 placeholder:text-ivory/15",
                      "focus:border-gold/30 focus:outline-none focus:ring-1 focus:ring-gold/15"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating save bar (mobile) */}
      {dirtyCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/15 bg-obsidian/95 p-3 backdrop-blur-xl md:hidden">
          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full gap-2"
          >
            <Save size={16} />
            {saving
              ? "Saving..."
              : `Save ${dirtyCount} change${dirtyCount > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
