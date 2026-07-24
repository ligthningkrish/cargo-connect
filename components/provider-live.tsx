"use client";

import { useEffect, useState } from "react";
import { Plus, ShipWheel, CircleDollarSign, PackageOpen } from "lucide-react";
import { AppShell, type DashboardTab } from "@/components/app-shell";
import { CargoGrid } from "@/components/cargo-grid";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LiveContainer = { id: string; origin: string; destination: string; departure_date: string; price_per_box: number; total_boxes: number; occupied_boxes: number; status: string };

export function ProviderLive() {
  const [items, setItems] = useState<LiveContainer[]>([]);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ origin: "Mumbai", destination: "Rotterdam", departure_date: "2026-08-18", price_per_box: "46", total_boxes: "100" });

  const getProvider = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please sign in first.");
    const { data: existing, error: findError } = await supabase.from("providers").select("id").eq("profile_id", user.id).maybeSingle();
    if (findError) throw findError;
    if (existing) return existing;
    // Repairs accounts created before the provider-company trigger was installed.
    const { data: created, error: createError } = await supabase.from("providers").insert({ profile_id: user.id, company_name: "My logistics company", status: "pending" }).select("id").single();
    if (createError) throw createError;
    return created;
  };

  const load = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const provider = await getProvider();
      const { data, error } = await supabase.from("containers").select("*").eq("provider_id", provider.id).order("departure_date", { ascending: false });
      if (error) throw error;
      setItems(data ?? []);
    } catch {
      setNotice("Sign in with a Provider account to manage live containers.");
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setNotice("");
    try {
      const supabase = getSupabaseBrowserClient();
      const provider = await getProvider();
      const { error } = await supabase.from("containers").insert({ provider_id: provider.id, origin: form.origin, destination: form.destination, departure_date: form.departure_date, price_per_box: Number(form.price_per_box), total_boxes: Number(form.total_boxes), occupied_boxes: 0, status: "active" });
      if (error) throw error;
      setOpen(false); setNotice("Container saved. Traders can now discover this route."); await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save container.");
    } finally { setSaving(false); }
  };

  const totalAvailable = items.reduce((sum, item) => sum + item.total_boxes - item.occupied_boxes, 0);
  const bookedValue = items.reduce((sum, item) => sum + item.occupied_boxes * Number(item.price_per_box), 0);
  const content = (tab: DashboardTab) => {
    if (tab === "Bookings") return <section><p className="text-sm text-slate-500">Confirmed trader reservations for your routes.</p><h2 className="mt-1 text-3xl font-bold text-navy">Incoming bookings</h2><div className="mt-8 rounded-2xl bg-white p-7 text-center shadow-sm"><ShipWheel className="mx-auto text-sky" size={30} /><h3 className="mt-4 font-bold text-navy">Booking activity will appear here.</h3><p className="mt-2 text-sm text-slate-500">As traders complete bookings, you will see their shipment details and contact information.</p></div></section>;
    if (tab === "Containers") return <section><div className="flex flex-col justify-between gap-4 md:flex-row"><div><p className="text-sm text-slate-500">Publish and monitor your live marketplace inventory.</p><h2 className="mt-1 text-3xl font-bold text-navy">My containers</h2></div><button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white"><Plus size={17} />Add container</button></div><ContainerList items={items} onAdd={() => setOpen(true)} /></section>;
    return <section><div className="flex flex-col justify-between gap-4 md:flex-row"><div><p className="text-sm text-slate-500">Your live marketplace inventory.</p><h2 className="mt-1 text-3xl font-bold text-navy">Provider overview</h2></div><button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white"><Plus size={17} />Add container</button></div>{notice && <div className="mt-5 rounded-xl bg-sky/10 p-4 text-sm font-semibold text-navy">{notice}</div>}<div className="mt-8 grid gap-4 md:grid-cols-3"><Metric icon={PackageOpen} value={String(items.length)} label="Live container routes" color="text-sky" /><Metric icon={ShipWheel} value={String(totalAvailable)} label="Boxes still available" color="text-orange" /><Metric icon={CircleDollarSign} value={`$${bookedValue}`} label="Booked capacity value" color="text-emerald-600" /></div><div className="mt-8"><ContainerList items={items.slice(0, 2)} onAdd={() => setOpen(true)} /></div></section>;
  };

  return <AppShell role="provider">{tab => <>{content(tab)}{open && <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-5"><div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><h3 className="text-2xl font-bold text-navy">Add a container route</h3><p className="mt-2 text-sm text-slate-500">Publish spare capacity for traders to book.</p><div className="mt-6 grid gap-3"><input value={form.origin} onChange={event => setForm({ ...form, origin: event.target.value })} placeholder="Origin" className="rounded-xl border p-3 font-semibold text-black" /><input value={form.destination} onChange={event => setForm({ ...form, destination: event.target.value })} placeholder="Destination" className="rounded-xl border p-3 font-semibold text-black" /><input value={form.departure_date} onChange={event => setForm({ ...form, departure_date: event.target.value })} type="date" className="rounded-xl border p-3 font-semibold text-black" /><div className="grid grid-cols-2 gap-3"><input value={form.price_per_box} onChange={event => setForm({ ...form, price_per_box: event.target.value })} type="number" placeholder="Price per box" className="rounded-xl border p-3 font-semibold text-black" /><input value={form.total_boxes} onChange={event => setForm({ ...form, total_boxes: event.target.value })} type="number" placeholder="Total boxes" className="rounded-xl border p-3 font-semibold text-black" /></div></div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setOpen(false)} className="px-4 text-sm font-bold text-slate-500">Cancel</button><button disabled={saving} onClick={save} className="rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Publish container"}</button></div></div></div>}</>}</AppShell>;
}

function Metric({ icon: Icon, value, label, color }: { icon: typeof ShipWheel; value: string; label: string; color: string }) { return <div className="rounded-2xl bg-white p-5 shadow-sm"><Icon className={color} /><p className="mt-5 text-2xl font-bold text-navy">{value}</p><p className="text-sm text-slate-500">{label}</p></div>; }
function ContainerList({ items, onAdd }: { items: LiveContainer[]; onAdd: () => void }) { return <div className="grid gap-5 lg:grid-cols-2">{items.length ? items.map(item => <article key={item.id} className="rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-sky">LIVE CONTAINER</p><h3 className="mt-1 text-xl font-bold text-navy">{item.origin} → {item.destination}</h3><p className="mt-2 text-sm text-slate-500">Departs {new Date(item.departure_date).toLocaleDateString()}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Active</span></div><div className="mt-6"><CargoGrid occupied={item.occupied_boxes} capacity={item.total_boxes} /></div><p className="mt-5 font-bold text-navy">${item.price_per_box} per box</p></article>) : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center lg:col-span-2"><ShipWheel className="mx-auto text-sky" size={30} /><h3 className="mt-4 text-xl font-bold text-navy">Your fleet is ready for its first route.</h3><p className="mt-2 text-slate-500">Add a container to make capacity discoverable by traders.</p><button onClick={onAdd} className="mt-6 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white">Add your first container</button></div>}</div>; }
