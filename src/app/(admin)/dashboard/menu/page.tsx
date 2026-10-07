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
          { key: "tiers", label: "Catering Tiers", icon: "fa-layer-group" },
          { key: "addons", label: "Live Stations", icon: "fa-fire-burner" },
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

/* ─── Tiers Tab ─────────────────────────────── */
function TiersTab() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", base_price_per_pax: "", min_pax: "", max_pax: "" });

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiGet("/admin/catering/tiers");
      setTiers(json.data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({ name: t.name, description: t.description || "", base_price_per_pax: t.base_price_per_pax, min_pax: t.min_pax || "", max_pax: t.max_pax || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, base_price_per_pax: parseFloat(form.base_price_per_pax), min_pax: parseInt(form.min_pax), max_pax: form.max_pax ? parseInt(form.max_pax) : null };
      if (editing) await apiPut(`/admin/catering/tiers/${editing.id}`, payload);
      else await apiPost("/admin/catering/tiers", payload);
      setShowModal(false);
      fetchTiers();
    } catch (e: any) { alert(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div></div>;

  const TIER_COLORS = ["from-slate-400 to-slate-500", "from-yellow-400 to-amber-500", "from-violet-400 to-purple-500"];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setForm({ name: "", description: "", base_price_per_pax: "", min_pax: "", max_pax: "" }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer transform hover:scale-105 active:scale-95">
          <i className="fa-solid fa-plus"></i> Add Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, i) => (
          <div key={tier.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-br ${TIER_COLORS[i % 3]} p-6 text-white`}>
              <h3 className="font-serif font-extrabold text-2xl">{tier.name}</h3>
              <p className="text-white/70 text-sm mt-1">{tier.description}</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Per Pax</span>
                <span className="font-extrabold text-xl text-slate-900 dark:text-white">Rs. {Number(tier.base_price_per_pax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Min Pax</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{tier.min_pax}</span>
              </div>
              {tier.max_pax && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Max Pax</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{tier.max_pax}</span>
                </div>
              )}
              <button onClick={() => openEdit(tier)} className="w-full mt-2 py-2.5 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
                <i className="fa-solid fa-pen-to-square mr-2"></i>Edit Tier
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Tier" : "Add Tier"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tier Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="e.g. Gold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="Brief description" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Price/Pax</label>
              <input required type="number" min="0" value={form.base_price_per_pax} onChange={(e) => setForm({ ...form, base_price_per_pax: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="Rs." />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Min Pax</label>
              <input required type="number" min="1" value={form.min_pax} onChange={(e) => setForm({ ...form, min_pax: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Max Pax</label>
              <input type="number" min="1" value={form.max_pax} onChange={(e) => setForm({ ...form, max_pax: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl disabled:opacity-60 cursor-pointer">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Add Tier"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Addons Tab ─────────────────────────────── */
function AddonsTab() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price_per_pax: "", icon: "" });

  const fetchAddons = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiGet("/admin/catering/addons");
      setAddons(json.data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAddons(); }, [fetchAddons]);

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({ name: a.name, description: a.description || "", price_per_pax: a.price_per_pax, icon: a.icon || "" });
    setShowModal(true);
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

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E36727]"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setForm({ name: "", description: "", price_per_pax: "", icon: "" }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#E36727] hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer transform hover:scale-105 active:scale-95">
          <i className="fa-solid fa-plus"></i> Add Station
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {addons.length === 0 ? (
            <div className="py-24 text-center"><i className="fa-solid fa-fire-burner text-4xl text-slate-300 mb-4 block"></i><p className="text-slate-500">No addons found.</p></div>
          ) : addons.map((addon) => (
            <div key={addon.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#E36727]/10 text-[#E36727] flex items-center justify-center flex-shrink-0">
                <i className={`fa-solid ${addon.icon || "fa-fire"}`}></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white">{addon.name}</p>
                <p className="text-xs text-slate-400">{addon.description}</p>
              </div>
              <p className="font-extrabold text-[#E36727]">+Rs. {Number(addon.price_per_pax).toLocaleString()}/pax</p>
              <button onClick={() => openEdit(addon)} className="text-xs font-bold text-slate-400 hover:text-[#E36727] transition-colors cursor-pointer ml-2">
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Station" : "Add Live Station"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Station Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="e.g. BBQ Station" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="Brief description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Price per Pax (Rs.)</label>
              <input required type="number" min="0" value={form.price_per_pax} onChange={(e) => setForm({ ...form, price_per_pax: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon (FontAwesome)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#E36727] transition-colors" placeholder="fa-fire" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#E36727] hover:bg-amber-600 text-white font-extrabold rounded-xl disabled:opacity-60 cursor-pointer">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Add Station"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
