"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import Modal from "@/components/admin/Modal";

type ActiveTab = "products" | "tiers" | "addons";

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("products");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">Menu Catalog</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage takeaway products and catering options.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 w-fit">
        {([
          { key: "products", label: "Takeaway Menu", icon: "fa-burger" },
          { key: "tiers", label: "Catering Tiers (Menus)", icon: "fa-layer-group" },
          { key: "addons", label: "Additional Charge Items & Free Services", icon: "fa-plate-wheat" },
        ] as { key: ActiveTab; label: string; icon: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === tab.key ? "bg-[#E36727] text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
          >
            <i className={`fa-solid ${tab.icon} text-xs`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "products" && <ProductsTab />}
      {activeTab === "tiers" && <TiersTab />}
      {activeTab === "addons" && <AddonsTab />}
    </div>
  );
}

/* ─── Products Tab ─────────────────────────── */
function ProductsTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category_id: "", portion_label: "", image_url: "", is_available: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catJson, prodJson] = await Promise.all([
        apiGet("/admin/products/categories"),
        apiGet("/admin/products?limit=100"),
      ]);
      setCategories(catJson.data || []);
      setProducts(prodJson.data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: "", category_id: "", portion_label: "", image_url: "", is_available: true });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: p.price, category_id: p.category_id, portion_label: p.portion_label || "", image_url: p.image_url || "", is_available: p.is_available });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), category_id: parseInt(form.category_id) };
      if (editing) await apiPut(`/admin/products/${editing.id}`, payload);
      else await apiPost("/admin/products", payload);
      setShowModal(false);
      fetchData();
    } catch (e: any) { alert(e.message); } finally { setSubmitting(false); }
  };

  const toggleAvailable = async (p: any) => {
    setToggling(p.id);
    try {
      await apiPut(`/admin/products/${p.id}`, { is_available: !p.is_available });
      fetchData();
    } catch { } finally { setToggling(null); }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer transform hover:scale-105 active:scale-95">
          <i className="fa-solid fa-plus"></i> Add Product
        </button>
      </div>

      {/* Products by Category */}
      {categories.map((cat) => {
        const catProducts = products.filter((p) => p.category_id === cat.id);
        if (catProducts.length === 0) return null;
        return (
          <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">{cat.name}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {catProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-slate-100" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.portion_label}</p>
                  </div>
                  <p className="font-extrabold text-[#E36727]">Rs. {Number(p.price).toLocaleString()}</p>
                  <button
                    disabled={toggling === p.id}
                    onClick={() => toggleAvailable(p)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${p.is_available ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20" : "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20"}`}
                  >
                    {toggling === p.id ? "..." : p.is_available ? "In Stock" : "Out of Stock"}
                  </button>
                  <button onClick={() => openEdit(p)} className="text-xs font-bold text-slate-400 hover:text-[#E36727] transition-colors cursor-pointer">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="Product name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
            <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors cursor-pointer">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Price (Rs.)</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Portion Label</label>
              <input value={form.portion_label} onChange={(e) => setForm({ ...form, portion_label: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="e.g. Per Packet" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Image URL</label>
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="https://..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl transition-all disabled:opacity-60 cursor-pointer">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Catering Menus / Tiers Tab ─────────────────────────────── */
interface CateringPackageItem {
  id: number;
  name: string;
  badge: string;
  description: string;
  price_per_pax: number;
  min_pax: number;
  inclusions_text: string;
  dessert_text?: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

interface CateringCategoryItem {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  subtitle?: string;
  description?: string;
  min_price_per_pax?: number;
  min_pax?: number;
  is_active: boolean;
  sort_order?: number;
}

const COMMON_CATEGORY_ICONS = [
  { icon: "fa-om", label: "🪷 Bana / Pirith" },
  { icon: "fa-dharmachakra", label: "☸️ Monk Dana" },
  { icon: "fa-users", label: "👥 Guest Dana" },
  { icon: "fa-champagne-glasses", label: "🥂 Wedding" },
  { icon: "fa-ring", label: "💍 Reception" },
  { icon: "fa-building", label: "🏢 Corporate" },
  { icon: "fa-cake-candles", label: "🎂 Birthday / Party" },
  { icon: "fa-utensils", label: "🍽️ Buffet / Dining" },
  { icon: "fa-bowl-rice", label: "🍚 Traditional Rice" },
  { icon: "fa-star", label: "⭐ Special Offer" },
];

function TiersTab() {
  const [packages, setPackages] = useState<CateringPackageItem[]>([]);
  const [categories, setCategories] = useState<CateringCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CateringPackageItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Category Management State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CateringCategoryItem | null>(null);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "fa-champagne-glasses",
    subtitle: "",
    description: "",
    min_pax: "20",
    sort_order: "0",
    is_active: true,
  });

  const [form, setForm] = useState({
    name: "",
    badge: "Bana / Pirith",
    description: "",
    price_per_pax: "",
    min_pax: "20",
    inclusions_text: "",
    dessert_text: "",
    is_featured: false,
    is_active: true,
    sort_order: "0",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const json = await apiGet("/admin/catering/event-types");
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setCategories(json.data);
        return;
      }
    } catch {
      try {
        const pubRes = await fetch("http://localhost:5050/api/public/catering/event-types");
        if (pubRes.ok) {
          const pubJson = await pubRes.json();
          if (pubJson.success && Array.isArray(pubJson.data) && pubJson.data.length > 0) {
            setCategories(pubJson.data);
            return;
          }
        }
      } catch { }
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiGet("/admin/catering/packages");
      if (json.data && Array.isArray(json.data)) {
        setPackages(json.data);
        return;
      }
    } catch {
      // Fallback to public endpoint if admin token is absent in local preview
      try {
        const pubRes = await fetch("http://localhost:5050/api/public/catering/packages");
        if (pubRes.ok) {
          const pubJson = await pubRes.json();
          if (pubJson.success && Array.isArray(pubJson.data)) {
            setPackages(pubJson.data);
            return;
          }
        }
      } catch { }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchCategories();
  }, [fetchPackages, fetchCategories]);

  // Helper to match package with category
  const matchPackageCategory = (p: CateringPackageItem, cat: CateringCategoryItem) => {
    const badge = (p.badge || "").toLowerCase();
    const catSlug = (cat.slug || "").toLowerCase();
    const catName = (cat.name || "").toLowerCase();

    if (catSlug === "bana" || catName.includes("bana")) {
      return badge.includes("bana") || badge.includes("feast");
    }
    if (catSlug === "dana-monk" || catSlug === "dana_monk" || catName.includes("monk")) {
      return badge === "dana - monk" || badge.includes("monk");
    }
    if (catSlug === "dana-guest" || catSlug === "dana_guest" || catName.includes("guest")) {
      return badge === "dana - guest" || badge.includes("guest");
    }
    return badge === catName || badge.includes(catName) || catName.includes(badge);
  };

  const openCreate = () => {
    setEditing(null);
    const defaultBadge = categories.length > 0 ? categories[0].name : "Bana / Pirith";
    setForm({
      name: "",
      badge: defaultBadge,
      description: "",
      price_per_pax: "",
      min_pax: "20",
      inclusions_text: "",
      dessert_text: "",
      is_featured: false,
      is_active: true,
      sort_order: String(packages.length + 1),
    });
    setShowModal(true);
  };

  const openEdit = (p: CateringPackageItem) => {
    setEditing(p);
    setForm({
      name: p.name,
      badge: p.badge || "Bana / Pirith",
      description: p.description || "",
      price_per_pax: String(p.price_per_pax),
      min_pax: String(p.min_pax || 20),
      inclusions_text: p.inclusions_text || "",
      dessert_text: p.dessert_text || "",
      is_featured: Boolean(p.is_featured),
      is_active: p.is_active !== false,
      sort_order: String(p.sort_order || 0),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        badge: form.badge.trim(),
        description: form.description.trim(),
        price_per_pax: parseFloat(form.price_per_pax),
        min_pax: parseInt(form.min_pax) || 20,
        inclusions_text: form.inclusions_text.trim(),
        dessert_text: form.dessert_text.trim(),
        is_featured: Boolean(form.is_featured),
        is_active: Boolean(form.is_active),
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (editing) {
        await apiPut(`/admin/catering/packages/${editing.id}`, payload);
      } else {
        await apiPost("/admin/catering/packages", payload);
      }
      setShowModal(false);
      fetchPackages();
    } catch (e: any) {
      alert(e.message || "Failed to save catering menu");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (p: CateringPackageItem) => {
    setToggling(p.id);
    try {
      await apiPut(`/admin/catering/packages/${p.id}`, { is_active: !p.is_active });
      fetchPackages();
    } catch (e: any) {
      alert(e.message || "Failed to toggle status");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (p: CateringPackageItem) => {
    if (!confirm(`Are you sure you want to delete "${p.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await apiDelete(`/admin/catering/packages/${p.id}`);
      fetchPackages();
    } catch (e: any) {
      alert(e.message || "Failed to delete catering menu");
    }
  };

  // Category Actions
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      slug: "",
      icon: "fa-champagne-glasses",
      subtitle: "",
      description: "",
      min_pax: "20",
      sort_order: String(categories.length + 1),
      is_active: true,
    });
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat: CateringCategoryItem) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug || "",
      icon: cat.icon || "fa-utensils",
      subtitle: cat.subtitle || "",
      description: cat.description || "",
      min_pax: String(cat.min_pax || 20),
      sort_order: String(cat.sort_order || 0),
      is_active: cat.is_active !== false,
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert("Category name is required");
      return;
    }
    setSubmittingCategory(true);
    try {
      const generatedSlug = (categoryForm.slug || categoryForm.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const payload = {
        name: categoryForm.name.trim(),
        slug: generatedSlug || `cat-${Date.now()}`,
        icon: categoryForm.icon.trim() || "fa-utensils",
        subtitle: categoryForm.subtitle.trim(),
        description: categoryForm.description.trim(),
        min_pax: parseInt(categoryForm.min_pax) || 20,
        sort_order: parseInt(categoryForm.sort_order) || 0,
        is_active: Boolean(categoryForm.is_active),
      };

      if (editingCategory) {
        await apiPut(`/admin/catering/event-types/${editingCategory.id}`, payload);
      } else {
        await apiPost("/admin/catering/event-types", payload);
      }

      setShowCategoryModal(false);
      await fetchCategories();
      // If adding new, automatically pre-select it in package form if package modal is open
      setForm((prev) => ({ ...prev, badge: payload.name }));
    } catch (e: any) {
      alert(e.message || "Failed to save catering category");
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: CateringCategoryItem) => {
    const usageCount = packages.filter((p) => matchPackageCategory(p, cat)).length;
    const confirmMsg =
      usageCount > 0
        ? `Warning: Category "${cat.name}" currently has ${usageCount} package(s) associated with it. Are you sure you want to delete this category?`
        : `Are you sure you want to delete category "${cat.name}"?`;

    if (!confirm(confirmMsg)) return;

    setDeletingCategoryId(cat.id);
    try {
      await apiDelete(`/admin/catering/event-types/${cat.id}`);
      await fetchCategories();
      if (selectedFilter === cat.slug || selectedFilter === String(cat.id)) {
        setSelectedFilter("all");
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete category");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // Build filter pills list combining database categories and any legacy package badges
  const filterTabs = [
    { key: "all", label: "All Menus", count: packages.length, icon: "fa-layer-group" },
    ...categories.map((cat) => ({
      key: cat.slug || String(cat.id),
      label: cat.name,
      count: packages.filter((p) => matchPackageCategory(p, cat)).length,
      icon: cat.icon || "fa-tag",
    })),
  ];

  // Also include any packages with unique badges not yet in category table
  const unmappedBadges = Array.from(new Set(packages.map((p) => p.badge))).filter(
    (b) => b && !categories.some((c) => matchPackageCategory({ badge: b } as any, c))
  );
  unmappedBadges.forEach((badge) => {
    filterTabs.push({
      key: badge,
      label: badge,
      count: packages.filter((p) => p.badge === badge).length,
      icon: "fa-tag",
    });
  });

  const filteredPackages = packages.filter((p) => {
    if (selectedFilter !== "all") {
      const activeCat = categories.find((c) => (c.slug && c.slug === selectedFilter) || String(c.id) === selectedFilter);
      if (activeCat) {
        if (!matchPackageCategory(p, activeCat)) return false;
      } else {
        if (p.badge !== selectedFilter) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBadge = (p.badge || "").toLowerCase().includes(q);
      const matchDesc = (p.description || "").toLowerCase().includes(q);
      const matchInclusions = (p.inclusions_text || "").toLowerCase().includes(q);
      const matchDessert = (p.dessert_text || "").toLowerCase().includes(q);
      return matchName || matchBadge || matchDesc || matchInclusions || matchDessert;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Catering Menus & Packages</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E36727]/15 text-[#E36727]">
              {categories.length} Categories
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {packages.length} active catering packages synced directly from database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateCategory}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
            title="Create a new catering package category"
          >
            <i className="fa-solid fa-folder-plus text-[#E36727]"></i>
            <span>Add Category</span>
          </button>

          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Manage all catering categories"
          >
            <i className="fa-solid fa-list-check text-slate-500"></i>
            <span>Manage Categories</span>
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Catering Menu</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Dynamic Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                selectedFilter === tab.key
                  ? "bg-[#E36727] text-white shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60"
              }`}
            >
              {tab.icon && (
                <i
                  className={`${
                    tab.icon.startsWith("fa-") ? `fa-solid ${tab.icon}` : ""
                  } text-[10px] ${selectedFilter === tab.key ? "text-white" : "text-[#E36727]"}`}
                ></i>
              )}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  selectedFilter === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu or dishes..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#E36727]"
          />
        </div>
      </div>

      {/* Menus Grid */}
      {filteredPackages.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <i className="fa-solid fa-utensils text-4xl text-slate-300 mb-3 block"></i>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No catering menus match your selection.</p>
          <div className="mt-4 flex justify-center gap-3">
            {selectedFilter !== "all" && (
              <button
                onClick={() => setSelectedFilter("all")}
                className="text-xs text-[#E36727] font-bold hover:underline"
              >
                View All Menus
              </button>
            )}
            <button
              onClick={openCreate}
              className="text-xs bg-[#E36727] text-white font-bold px-3 py-1.5 rounded-xl hover:bg-amber-600"
            >
              + Create Menu in this Category
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const isBana = pkg.badge.includes("Bana") || pkg.badge.includes("Feast");
            const isMonk = pkg.badge === "Dana - Monk";
            const isGuest = pkg.badge === "Dana - Guest";

            const inclusions = pkg.inclusions_text
              ? pkg.inclusions_text.split(",").map((s) => s.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={pkg.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md ${
                  pkg.is_active === false
                    ? "opacity-60 border-slate-200 dark:border-slate-800"
                    : "border-slate-200 dark:border-slate-800 hover:border-[#E36727]/60"
                }`}
              >
                {/* Header Banner */}
                <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/30">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        isBana
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          : isMonk
                          ? "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
                          : isGuest
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {pkg.badge}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {pkg.is_featured && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <i className="fa-solid fa-star text-[9px] mr-1"></i>Featured
                        </span>
                      )}

                      <button
                        disabled={toggling === pkg.id}
                        onClick={() => toggleActive(pkg)}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          pkg.is_active !== false
                            ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40"
                            : "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40"
                        }`}
                        title="Click to toggle active status"
                      >
                        {toggling === pkg.id
                          ? "..."
                          : pkg.is_active !== false
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {pkg.name}
                  </h3>

                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="font-serif text-2xl font-extrabold text-[#E36727]">
                        Rs. {Number(pkg.price_per_pax).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-bold ml-1">/ plate</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Min: {pkg.min_pax || 20} Pax
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {pkg.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>
                    )}

                    {/* Inclusions summary */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span>Menu Inclusions:</span>
                        <span className="text-[#E36727]">{inclusions.length} items</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                        {inclusions.slice(0, 6).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md truncate max-w-[200px]"
                            title={item}
                          >
                            {item}
                          </span>
                        ))}
                        {inclusions.length > 6 && (
                          <span className="text-[10px] text-slate-400 px-1 py-0.5 font-bold">
                            +{inclusions.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dessert summary */}
                    {pkg.dessert_text && (
                      <div className="mt-2.5 pt-2.5 border-t border-dashed border-amber-200/80 dark:border-amber-900/40">
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5">
                          <i className="fa-solid fa-ice-cream text-[10px]"></i>
                          <span>Dessert:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pkg.dessert_text
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((dItem, dIdx) => (
                              <span
                                key={dIdx}
                                className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 px-2 py-0.5 rounded-md font-medium"
                              >
                                {dItem}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => openEdit(pkg)}
                      className="flex-1 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i className="fa-solid fa-pen-to-square text-amber-500"></i>
                      <span>Edit Menu</span>
                    </button>

                    <button
                      onClick={() => handleDelete(pkg)}
                      className="px-3 py-2 text-xs font-bold border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors cursor-pointer flex items-center justify-center"
                      title="Delete menu"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Menu Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? `Edit Menu: ${editing.name}` : "Add Catering Menu"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Menu Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
              placeholder="e.g. Bana / Pirith Dinner - Menu 01"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Category / Badge <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="text-xs font-bold text-[#E36727] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-plus text-[10px]"></i> New Category
                </button>
              </div>
              <select
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.subtitle ? `— ${c.subtitle}` : ""}
                  </option>
                ))}
                {/* Include other custom badges from existing packages if not in categories list */}
                {Array.from(new Set(packages.map((p) => p.badge)))
                  .filter((b) => b && !categories.some((c) => c.name.toLowerCase() === b.toLowerCase()))
                  .map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Price Per Pax (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.price_per_pax}
                onChange={(e) => setForm({ ...form, price_per_pax: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
                placeholder="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Pax
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.min_pax}
                onChange={(e) => setForm({ ...form, min_pax: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
              placeholder="Short overview of this catering menu"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Menu Courses & Inclusions (Comma-separated)
            </label>
            <textarea
              rows={3}
              value={form.inclusions_text}
              onChange={(e) => setForm({ ...form, inclusions_text: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
              placeholder="Keeri Samba Steam Rice, Red Rice, Thalapath Fish Ambulthiyal, Dhal Curry, ..."
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Enter each dish separated by a comma. These will display as individual items in the customer menu.
            </span>
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-ice-cream text-xs"></i>
              Dessert (Comma-separated)
            </label>
            <input
              value={form.dessert_text}
              onChange={(e) => setForm({ ...form, dessert_text: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
              placeholder="Watalappam, Fresh Fruits Salad, Ice Cream, ..."
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Enter desserts separated by a comma. These will display under the dedicated &quot;Dessert&quot; section in both the customer menu and admin portal.
            </span>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-[#E36727] focus:ring-[#E36727] cursor-pointer"
              />
              <span>Featured Package</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-[#E36727] focus:ring-[#E36727] cursor-pointer"
              />
              <span>Active & Bookable</span>
            </label>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-md"
            >
              {submitting ? "Saving..." : editing ? "Save Changes" : "Add Catering Menu"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : "Add Catering Category"}
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={categoryForm.name}
              onChange={(e) => {
                const name = e.target.value;
                setCategoryForm((prev) => ({
                  ...prev,
                  name,
                  slug: editingCategory
                    ? prev.slug
                    : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                }));
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
              placeholder="e.g. Wedding Receptions, Corporate Buffets, Birthday Parties"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category Slug / Identifier
              </label>
              <input
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
                placeholder="e.g. wedding-receptions"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Used internally for URLs and filters</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Icon (FontAwesome / Emoji)
              </label>
              <div className="flex gap-2">
                <input
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors font-mono"
                  placeholder="fa-champagne-glasses"
                />
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm text-[#E36727] shrink-0">
                  {categoryForm.icon.startsWith("fa-") ? (
                    <i className={`fa-solid ${categoryForm.icon}`}></i>
                  ) : (
                    <span>{categoryForm.icon || "🍽️"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Icon Selector Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Quick Icon Suggestions:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CATEGORY_ICONS.map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => setCategoryForm({ ...categoryForm, icon: item.icon })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    categoryForm.icon === item.icon
                      ? "bg-[#E36727] text-white border-[#E36727]"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#E36727]"
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-[10px]`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Subtitle / Badge Label
            </label>
            <input
              value={categoryForm.subtitle}
              onChange={(e) => setCategoryForm({ ...categoryForm, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
              placeholder="e.g. Luxury Banqueting & Wedding Receptions"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
              placeholder="Short overview describing menus in this category"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Minimum Pax
              </label>
              <input
                type="number"
                min="1"
                value={categoryForm.min_pax}
                onChange={(e) => setCategoryForm({ ...categoryForm, min_pax: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors"
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={categoryForm.is_active}
                onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-[#E36727] focus:ring-[#E36727] cursor-pointer"
              />
              <span>Active Category (Visible to Customers)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCategory}
              className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-md"
            >
              {submittingCategory ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Manager Modal */}
      <Modal
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        title="Manage Catering Categories"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total {categories.length} categories defined in system.
            </span>
            <button
              onClick={() => {
                setShowCategoryManager(false);
                openCreateCategory();
              }}
              className="px-3 py-1.5 bg-[#E36727] hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <i className="fa-solid fa-plus text-[10px]"></i> Add New Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No categories configured yet. Click above to add your first catering category.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = packages.filter((p) => matchPackageCategory(p, cat)).length;
                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#E36727] border border-amber-500/20 flex items-center justify-center text-sm shrink-0">
                        {cat.icon && cat.icon.startsWith("fa-") ? (
                          <i className={`fa-solid ${cat.icon}`}></i>
                        ) : (
                          <span>{cat.icon || "🍽️"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {cat.name}
                          </h4>
                          {cat.is_active === false && (
                            <span className="text-[9px] bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 px-1.5 py-0.2 rounded font-bold">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-2 mt-0.5">
                          <span>{cat.subtitle || `Slug: ${cat.slug}`}</span>
                          <span>•</span>
                          <span className="text-[#E36727] font-semibold">{count} package{count === 1 ? "" : "s"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setShowCategoryManager(false);
                          openEditCategory(cat);
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#E36727] text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                        title="Edit category"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>

                      <button
                        disabled={deletingCategoryId === cat.id}
                        onClick={() => handleDeleteCategory(cat)}
                        className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg border border-red-200 dark:border-red-900/40 cursor-pointer transition-colors"
                        title="Delete category"
                      >
                        {deletingCategoryId === cat.id ? "..." : <i className="fa-solid fa-trash-can"></i>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setShowCategoryManager(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


/* ─── Addons Tab (Additional Charge Items & Free Services) ─────────── */
interface PolicyItem {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface ServiceTermsData {
  section_title: string;
  policies: PolicyItem[];
}

function AddonsTab() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price_per_pax: "", icon: "" });

  // Free Services / Terms & Policies State
  const [serviceTerms, setServiceTerms] = useState<ServiceTermsData>({
    section_title: "Important Service Terms & Logistics Policies",
    policies: [
      {
        id: "equipment-staff",
        title: "Equipment & Staff",
        icon: "fa-utensils",
        description: "Service includes Plateware, Glassware, Cutlery, Trays, Serviettes, Water Dispensers, and Hand Washing Sinks. Experienced serving staff supervised directly by our floor managers.",
      },
      {
        id: "large-event-amenities",
        title: "Large Event Amenities",
        icon: "fa-tent",
        description: "Hut / Canopy, Tables, and Plastic Chairs will be provided Free of Charge for above 150 Guests. Lighting & Transport charges will be added additionally based on distance.",
      },
    ],
  });
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
  const [policyForm, setPolicyForm] = useState({ title: "", icon: "fa-utensils", description: "" });
  const [savingPolicy, setSavingPolicy] = useState(false);

  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [titleForm, setTitleForm] = useState("");

  const fetchAddons = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiGet("/admin/catering/addons");
      setAddons(json.data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  const fetchServiceTerms = useCallback(async () => {
    try {
      const json = await apiGet("/admin/settings/key/catering_service_terms");
      if (json.success && json.data?.setting_value) {
        const parsed = typeof json.data.setting_value === "string"
          ? JSON.parse(json.data.setting_value)
          : json.data.setting_value;
        if (parsed && Array.isArray(parsed.policies)) {
          setServiceTerms(parsed);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    fetchAddons();
    fetchServiceTerms();
  }, [fetchAddons, fetchServiceTerms]);

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({ name: a.name, description: a.description || "", price_per_pax: a.price_per_pax, icon: a.icon || "" });
    setShowModal(true);
  };

  const handleDeleteAddon = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from Additional Charge Items?`)) return;
    try {
      await apiDelete(`/admin/catering/addons/${id}`);
      fetchAddons();
    } catch (e: any) {
      alert(e.message || "Failed to remove item.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, price_per_pax: parseFloat(form.price_per_pax) };
      if (editing) await apiPut(`/admin/catering/addons/${editing.id}`, payload);
      else await apiPost("/admin/catering/addons", payload);
      setShowModal(false);
      fetchAddons();
    } catch (e: any) { alert(e.message); } finally { setSubmitting(false); }
  };

  // ─── Free Services & Policies Handlers ───
  const saveServiceTermsToBackend = async (newTerms: ServiceTermsData) => {
    setSavingPolicy(true);
    try {
      await apiPut("/admin/settings/key/catering_service_terms", {
        setting_value: JSON.stringify(newTerms),
        description: "Complimentary service terms and logistics policies for catering",
      });
      setServiceTerms(newTerms);
    } catch (e: any) {
      alert(e.message || "Failed to save terms.");
    } finally {
      setSavingPolicy(false);
    }
  };

  const openAddPolicy = () => {
    setEditingPolicy(null);
    setPolicyForm({ title: "", icon: "fa-utensils", description: "" });
    setPolicyModalOpen(true);
  };

  const openEditPolicy = (p: PolicyItem) => {
    setEditingPolicy(p);
    setPolicyForm({ title: p.title, icon: p.icon || "fa-circle-check", description: p.description });
    setPolicyModalOpen(true);
  };

  const handlePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedPolicies: PolicyItem[];
    if (editingPolicy) {
      updatedPolicies = serviceTerms.policies.map((p) =>
        p.id === editingPolicy.id ? { ...p, ...policyForm } : p
      );
    } else {
      const newPolicy: PolicyItem = {
        id: "policy-" + Date.now(),
        title: policyForm.title,
        icon: policyForm.icon || "fa-circle-check",
        description: policyForm.description,
      };
      updatedPolicies = [...serviceTerms.policies, newPolicy];
    }

    const updatedTerms = { ...serviceTerms, policies: updatedPolicies };
    await saveServiceTermsToBackend(updatedTerms);
    setPolicyModalOpen(false);
  };

  const handleDeletePolicy = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove the policy card "${title}"?`)) return;
    const updatedPolicies = serviceTerms.policies.filter((p) => p.id !== id);
    const updatedTerms = { ...serviceTerms, policies: updatedPolicies };
    await saveServiceTermsToBackend(updatedTerms);
  };

  const openEditTitle = () => {
    setTitleForm(serviceTerms.section_title);
    setTitleModalOpen(true);
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTerms = { ...serviceTerms, section_title: titleForm.trim() || "Important Service Terms & Logistics Policies" };
    await saveServiceTermsToBackend(updatedTerms);
    setTitleModalOpen(false);
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div></div>;

  return (
    <div className="space-y-8">
      {/* ─── Part 1: Additional Charge Items ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              Additional Charge Plate Items
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Extra paper plate wraps, fruits, and sweets billed additionally to clients.
            </p>
          </div>
          <button onClick={() => { setEditing(null); setForm({ name: "", description: "", price_per_pax: "", icon: "" }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer transform hover:scale-105 active:scale-95">
            <i className="fa-solid fa-plus"></i> Add Item
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {addons.length === 0 ? (
              <div className="py-16 text-center">
                <i className="fa-solid fa-plate-wheat text-4xl text-slate-300 mb-3 block"></i>
                <p className="text-slate-500 text-xs">No additional charge items found.</p>
              </div>
            ) : addons.map((addon) => (
              <div key={addon.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#E36727]/10 text-[#E36727] flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${addon.icon || "fa-plate-wheat"}`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">{addon.name}</p>
                  <p className="text-xs text-slate-400">{addon.description}</p>
                </div>
                <p className="font-extrabold text-[#E36727]">+Rs. {Number(addon.price_per_pax).toLocaleString()}/pax</p>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => openEdit(addon)} className="text-xs font-bold text-slate-400 hover:text-[#E36727] transition-colors cursor-pointer p-2 rounded-lg hover:bg-amber-500/10" title="Edit Item">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button onClick={() => handleDeleteAddon(addon.id, addon.name)} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-2 rounded-lg hover:bg-red-500/10" title="Remove Item">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Part 2: Free Services / Important Service Terms & Logistics Policies ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{serviceTerms.section_title}</span>
                <button
                  type="button"
                  onClick={openEditTitle}
                  className="text-xs text-slate-400 hover:text-[#E36727] p-1 cursor-pointer"
                  title="Edit Section Title"
                >
                  <i className="fa-solid fa-pencil"></i>
                </button>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage complimentary terms, equipment, staff, and free event amenity policies shown on the public catering page.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddPolicy}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-[#E36727] dark:hover:bg-[#E36727] text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer shrink-0"
          >
            <i className="fa-solid fa-plus"></i> Add Free Service Policy
          </button>
        </div>

        {/* Policy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceTerms.policies.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              No service terms configured. Click &ldquo;Add Free Service Policy&rdquo; to add one.
            </div>
          ) : (
            serviceTerms.policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-xs hover:border-[#E36727]/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#E36727]/10 text-[#E36727] flex items-center justify-center text-sm shrink-0">
                        <i className={`fa-solid ${policy.icon || "fa-circle-check"}`}></i>
                      </span>
                      <span>{policy.title}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditPolicy(policy)}
                        className="text-xs text-slate-400 hover:text-[#E36727] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Edit Policy"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePolicy(policy.id, policy.title)}
                        className="text-xs text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                        title="Remove Policy"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line pt-1">
                    {policy.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <i className="fa-solid fa-circle-check text-[10px]"></i> Active on Public Page
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Icon: {policy.icon}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Modal 1: Add / Edit Additional Charge Item ─── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Item" : "Add Additional Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Item Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="e.g. Dish Of Fruits (Large Paper Plate with Wrapping)" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="Brief description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Price per Pax / Plate (Rs.)</label>
              <input required type="number" min="0" value={form.price_per_pax} onChange={(e) => setForm({ ...form, price_per_pax: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon (FontAwesome)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="fa-apple-whole" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl disabled:opacity-60 cursor-pointer">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 2: Add / Edit Policy Card ─── */}
      <Modal isOpen={policyModalOpen} onClose={() => setPolicyModalOpen(false)} title={editingPolicy ? "Edit Free Service / Policy" : "Add Free Service / Policy"}>
        <form onSubmit={handlePolicySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Policy / Service Title</label>
            <input required value={policyForm.title} onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="e.g. Equipment & Staff" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon (FontAwesome)</label>
            <div className="flex gap-2">
              <input value={policyForm.icon} onChange={(e) => setPolicyForm({ ...policyForm, icon: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="e.g. fa-utensils, fa-tent, fa-gift" />
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#E36727] flex items-center justify-center text-lg">
                <i className={`fa-solid ${policyForm.icon || "fa-circle-check"}`}></i>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["fa-utensils", "fa-tent", "fa-gift", "fa-truck", "fa-users", "fa-chair", "fa-plate-wheat"].map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setPolicyForm({ ...policyForm, icon: ic })}
                  className={`px-2 py-1 rounded-lg text-xs border cursor-pointer ${policyForm.icon === ic ? "border-[#E36727] bg-[#E36727]/10 text-[#E36727]" : "border-slate-200 dark:border-slate-700 text-slate-500"}`}
                >
                  <i className={`fa-solid ${ic} mr-1`}></i> {ic.replace("fa-", "")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Policy Description / Service Terms</label>
            <textarea required rows={4} value={policyForm.description} onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="Detail the complimentary amenities, staffing, and logistics conditions..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setPolicyModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={savingPolicy} className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl disabled:opacity-60 cursor-pointer">
              {savingPolicy ? "Saving..." : editingPolicy ? "Save Changes" : "Add Policy"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 3: Edit Section Title ─── */}
      <Modal isOpen={titleModalOpen} onClose={() => setTitleModalOpen(false)} title="Edit Section Title">
        <form onSubmit={handleTitleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Section Title</label>
            <input required value={titleForm} onChange={(e) => setTitleForm(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="e.g. Important Service Terms & Logistics Policies" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setTitleModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={savingPolicy} className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl disabled:opacity-60 cursor-pointer">
              {savingPolicy ? "Saving..." : "Save Title"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
