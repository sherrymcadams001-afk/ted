"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Briefcase,
  Cake,
  Gift,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  GripVertical,
  Save,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── Types ─── */
type MenuItem = {
  id: string;
  category: "corporate" | "bakery" | "gifting";
  name: string;
  description: string;
  badge: string | null;
  serves: string | null;
  leadTime: string | null;
  image: string;
  imagePrompt: string;
  sortOrder: number;
};

type FormData = Omit<MenuItem, "id" | "sortOrder"> & { sortOrder: number };

const emptyForm: FormData = {
  category: "corporate",
  name: "",
  description: "",
  badge: null,
  serves: null,
  leadTime: null,
  image: "",
  imagePrompt: "",
  sortOrder: 0,
};

const categories = [
  { id: "corporate" as const, label: "Corporate", icon: Briefcase },
  { id: "bakery" as const, label: "Bakery", icon: Cake },
  { id: "gifting" as const, label: "Gifting", icon: Gift },
];

/* ═══════════════════════════════════════════════ */
export default function AdminCuratePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<MenuItem["category"]>("corporate");

  // Editor state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /* ─── Auth guard ─── */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && session?.user?.role !== "admin")
      router.push("/dashboard");
  }, [status, session, router]);

  /* ─── Fetch items ─── */
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/curate");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") fetchItems();
  }, [status, session, fetchItems]);

  /* ─── Helpers ─── */
  const filtered = items
    .filter((i) => i.category === activeCategory)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, category: activeCategory, sortOrder: filtered.length });
    setDrawerOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      category: item.category,
      name: item.name,
      description: item.description,
      badge: item.badge,
      serves: item.serves,
      leadTime: item.leadTime,
      image: item.image,
      imagePrompt: item.imagePrompt,
      sortOrder: item.sortOrder,
    });
    setDrawerOpen(true);
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* ─── Image upload ─── */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { path } = await res.json();
        updateField("image", path);
      }
    } catch {
      /* silent */
    } finally {
      setUploading(false);
    }
  }

  /* ─── Save (create or update) ─── */
  async function handleSave() {
    if (!form.name.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        badge: form.badge?.trim() || null,
        serves: form.serves?.trim() || null,
        leadTime: form.leadTime?.trim() || null,
      };

      if (editing) {
        const res = await fetch(`/api/admin/curate/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { item } = await res.json();
          setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
        }
      } else {
        const res = await fetch("/api/admin/curate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { item } = await res.json();
          setItems((prev) => [...prev, item]);
        }
      }
      setDrawerOpen(false);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  }

  /* ─── Delete ─── */
  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/curate/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setDeleteConfirm(null);
      }
    } catch {
      /* silent */
    }
  }

  /* ─── Loading / guard ─── */
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }
  if (!session || session.user?.role !== "admin") return null;

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-14">
      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-2 inline-flex items-center gap-1 text-xs text-ivory/30 hover:text-ivory/50 transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Admin
          </Link>
          <h1 className="font-serif text-2xl font-bold text-ivory md:text-3xl">
            Menu Manager
          </h1>
          <p className="mt-1 text-sm text-ivory/40">
            Add, edit, reorder and upload images for every curate item
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={14} />
          Add Item
        </Button>
      </div>

      {/* ── Category Tabs ── */}
      <div className="mb-6 flex gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = items.filter((i) => i.category === cat.id).length;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium transition-all",
                isActive
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-gold/10 text-ivory/40 hover:border-gold/20 hover:text-ivory/60"
              )}
            >
              <Icon size={14} />
              {cat.label}
              <span className="ml-1 rounded-full bg-ivory/5 px-1.5 py-0.5 text-[10px] tabular-nums">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Item List ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gold/10 py-20 text-center">
          <ImageIcon size={32} className="text-ivory/10 mb-3" />
          <p className="text-sm text-ivory/30">No items in this category yet</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2 text-xs">
            <Plus size={12} />
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 rounded-xl border border-gold/8 bg-gold/[0.02] p-4 transition-all hover:border-gold/20"
            >
              {/* Drag handle placeholder */}
              <GripVertical size={16} className="shrink-0 text-ivory/10" />

              {/* Image preview */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ivory/5">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon size={20} className="text-ivory/15" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-ivory truncate">
                    {item.name}
                  </h3>
                  {item.badge && (
                    <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-gold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ivory/30 line-clamp-1">
                  {item.description}
                </p>
                <div className="mt-1 flex gap-3 text-[10px] text-ivory/20">
                  {item.serves && <span>{item.serves}</span>}
                  {item.leadTime && <span>{item.leadTime}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => openEdit(item)}
                  className="rounded-lg p-2 text-ivory/20 hover:bg-ivory/5 hover:text-gold transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                {deleteConfirm === item.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="rounded-lg p-1 text-ivory/30 hover:text-ivory/60"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="rounded-lg p-2 text-ivory/20 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
         EDITOR DRAWER
         ═══════════════════════════════════════════════ */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader>
            <DrawerTitle className="font-serif text-xl">
              {editing ? "Edit Item" : "New Item"}
            </DrawerTitle>
            <DrawerDescription className="text-ivory/40">
              {editing ? `Editing "${editing.name}"` : "Add a new menu item to the curate page"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-6 pb-4">
            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ivory/50">Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value as MenuItem["category"])}
                    className="w-full appearance-none rounded-lg border border-gold/10 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-gold/30 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30" />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ivory/50">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Executive Lunch Box"
                  className="w-full rounded-lg border border-gold/10 bg-obsidian px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/30 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ivory/50">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  placeholder="Describe this item..."
                  className="w-full resize-none rounded-lg border border-gold/10 bg-obsidian px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/30 focus:outline-none"
                />
              </div>

              {/* Badge / Serves / Lead Time row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ivory/50">Badge</label>
                  <input
                    type="text"
                    value={form.badge ?? ""}
                    onChange={(e) => updateField("badge", e.target.value || null)}
                    placeholder="Best Seller"
                    className="w-full rounded-lg border border-gold/10 bg-obsidian px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ivory/50">Serves</label>
                  <input
                    type="text"
                    value={form.serves ?? ""}
                    onChange={(e) => updateField("serves", e.target.value || null)}
                    placeholder="8–10 guests"
                    className="w-full rounded-lg border border-gold/10 bg-obsidian px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ivory/50">Lead Time</label>
                  <input
                    type="text"
                    value={form.leadTime ?? ""}
                    onChange={(e) => updateField("leadTime", e.target.value || null)}
                    placeholder="48 hrs"
                    className="w-full rounded-lg border border-gold/10 bg-obsidian px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/20 focus:border-gold/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ivory/50">Image</label>
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gold/10 bg-ivory/5">
                    {form.image ? (
                      <Image
                        src={form.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon size={24} className="text-ivory/15" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* Upload button */}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gold/15 px-3 py-2 text-xs text-ivory/60 hover:bg-gold/5 transition-colors">
                      <Upload size={12} />
                      {uploading ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {/* Or manual path */}
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => updateField("image", e.target.value)}
                      placeholder="/menu/my-image.jpg"
                      className="w-full rounded-lg border border-gold/10 bg-obsidian px-3 py-2 text-xs text-ivory placeholder:text-ivory/20 focus:border-gold/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Prompt */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ivory/50">
                  AI Image Prompt
                </label>
                <textarea
                  value={form.imagePrompt}
                  onChange={(e) => updateField("imagePrompt", e.target.value)}
                  rows={3}
                  placeholder="Detailed prompt for AI image generation..."
                  className="w-full resize-none rounded-lg border border-gold/10 bg-obsidian px-3 py-2.5 text-xs leading-relaxed text-ivory placeholder:text-ivory/20 focus:border-gold/30 focus:outline-none"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ivory/50">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => updateField("sortOrder", parseInt(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-gold/10 bg-obsidian px-3 py-2.5 text-sm text-ivory focus:border-gold/30 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="w-full gap-2">
              <Save size={14} />
              {saving ? "Saving..." : editing ? "Update Item" : "Create Item"}
            </Button>
            <DrawerClose className="w-full">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
