"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shield, Save, UserRound } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
};

export default function AdminProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/profile");
      if (res.status === 403) {
        router.push("/dashboard");
        return;
      }
      if (!res.ok) {
        setError("Could not load profile");
        return;
      }
      const data = await res.json();
      const p: Profile = data.profile;
      setProfile(p);
      setName(p.name ?? "");
      setEmail(p.email ?? "");
      setPhone(p.phone ?? "");
      setAvatar(p.avatar ?? "");
    } catch {
      setError("Could not load profile");
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
      loadProfile();
    }
  }, [status, session, router, loadProfile]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim() ? phone.trim() : null,
          avatar: avatar.trim() ? avatar.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not save profile");
        return;
      }

      const p: Profile = data.profile;
      setProfile(p);
      setName(p.name ?? "");
      setEmail(p.email ?? "");
      setPhone(p.phone ?? "");
      setAvatar(p.avatar ?? "");
    } catch {
      setError("Could not save profile");
    } finally {
      setSaving(false);
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
    <div className="mx-auto max-w-2xl px-5 py-8 md:py-14 lg:max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-gold/60" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60">
            Admin Settings
          </p>
        </div>
        <h1 className="font-serif text-2xl font-bold text-ivory md:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-ivory/40">
          Update your contact info for admin operations.
        </p>
      </div>

      <div className="rounded-xl border border-gold/10 bg-gold/[0.02] p-5">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gold/15 bg-ivory/[0.02]">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt="Admin avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ivory/20">
                <UserRound size={18} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ivory truncate">
              {profile?.name ?? "Admin"}
            </p>
            <p className="text-xs text-ivory/30 truncate">
              {profile?.email ?? ""}
            </p>
          </div>
        </div>

        <form onSubmit={onSave} className="flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              className={cn(
                "h-10 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                "border-gold/15 placeholder:text-ivory/20",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
              )}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contact email"
              required
              className={cn(
                "h-10 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                "border-gold/15 placeholder:text-ivory/20",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
              )}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className={cn(
                "h-10 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                "border-gold/15 placeholder:text-ivory/20",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
              )}
            />
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Profile image URL (optional)"
              className={cn(
                "h-10 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                "border-gold/15 placeholder:text-ivory/20",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
              )}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-burgundy/20 bg-burgundy/[0.08] px-3 py-2 text-xs text-burgundy-100">
              {error}
            </div>
          )}

          <Button type="submit" disabled={saving} className="h-10 gap-2">
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
}
