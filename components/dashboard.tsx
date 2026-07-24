"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronRight, CircleDollarSign, Mail, Phone, Search, ShipWheel, TrendingUp, Users, X } from "lucide-react";
import { AppShell, type DashboardTab } from "@/components/app-shell";
import { CargoGrid } from "@/components/cargo-grid";
import { CargoShip } from "@/components/ship";
import { containers, type Container, type Role } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Booking = { id: string; route: string; boxes: number; amount: number; status: string };
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function Stat({ label, value, icon: Icon, detail }: { label: string; value: string; icon: ComponentType<{ size?: number }>; detail: string }) {
  return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex justify-between"><span className="text-sm text-slate-500">{label}</span><span className="rounded-xl bg-sky/10 p-2 text-sky"><Icon size={18} /></span></div><p className="mt-5 text-2xl font-bold text-navy">{value}</p><p className="mt-1 text-xs text-emerald-600">{detail}</p></div>;
}

function ContainerCard({ container, onBook }: { container: Container; onBook: (container: Container) => void }) {
  return <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex justify-between"><div><p className="text-xs font-bold text-sky">{container.id}</p><h3 className="mt-1 font-bold text-navy">{container.route}</h3></div>{container.verified && <span className="h-fit rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">VERIFIED</span>}</div><div className="mt-4 flex gap-4 text-xs text-slate-500"><span className="flex items-center gap-1"><CalendarDays size={13} />{container.departure}</span><span className="flex items-center gap-1"><CircleDollarSign size={13} />${container.price}/box</span></div><div className="mt-5"><CargoGrid occupied={container.occupied} capacity={container.capacity} compact /></div><button onClick={() => onBook(container)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-bold text-white hover:bg-[#0a4775]">Book space <ChevronRight size={16} /></button></article>;
}

function BookingModal({ container, onClose, onBooked, onViewBookings }: { container: Container; onClose: () => void; onBooked: (boxes: number) => void; onViewBookings: () => void }) {
  const [boxes, setBoxes] = useState(1);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const available = container.capacity - container.occupied;

  const confirm = async () => {
    setError("");
    setPaying(true);
    try {
      // Sample routes are deliberately bookable without Stripe or a database record.
      // Real UUID routes use the protected Supabase transaction instead.
      if (isUuid(container.id)) {
        const supabase = getSupabaseBrowserClient();
        const { error: bookingError } = await supabase.rpc("book_container", { p_container_id: container.id, p_box_count: boxes });
        if (bookingError) throw bookingError;
      } else {
        await new Promise(resolve => window.setTimeout(resolve, 700));
      }
      onBooked(boxes);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking could not be completed.");
    } finally {
      setPaying(false);
    }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-5 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-7 shadow-2xl"><button onClick={onClose} className="absolute right-5 top-5 text-slate-400"><X /></button>{!done ? <><p className="text-sm font-bold text-sky">DEMO CHECKOUT</p><h2 className="mt-1 text-2xl font-bold text-navy">{container.route}</h2><p className="mt-2 text-sm text-slate-500">{container.company} · {container.departure}</p><div className="my-6 rounded-2xl bg-slate-50 p-4"><CargoGrid occupied={container.occupied + boxes} capacity={container.capacity} compact /></div><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">How many boxes?</p><p className="text-xs text-slate-500">${container.price} each · {available} still available</p></div><div className="flex items-center gap-3 rounded-xl border border-slate-200 p-1"><button onClick={() => setBoxes(Math.max(1, boxes - 1))} className="px-3 text-lg">−</button><b className="w-5 text-center">{boxes}</b><button onClick={() => setBoxes(Math.min(available, boxes + 1))} className="px-3 text-lg">+</button></div></div>{error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600">{error}</p>}<button disabled={paying} onClick={confirm} className="mt-6 w-full rounded-xl bg-orange py-3.5 text-sm font-bold text-white disabled:opacity-60">{paying ? "Processing demo payment…" : `Confirm demo payment · $${boxes * container.price}`}</button><p className="mt-3 text-center text-xs text-slate-400">No card details are needed for this project demo.</p></> : <div className="py-3 text-center"><p className="text-sm font-bold text-emerald-600">PAYMENT CONFIRMED</p><h2 className="mt-2 text-3xl font-bold text-navy">Your cargo is booked!</h2><p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">Your {boxes} box{boxes > 1 ? "es" : ""} are officially on board.</p><div className="my-8 flex h-44 items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#e1f5ff] to-[#86cbef]"><CargoShip sailing /></div><div className="rounded-2xl bg-sky/10 p-4 text-left"><p className="text-xs font-bold text-sky">PROVIDER CONTACT UNLOCKED</p><p className="mt-2 font-bold text-navy">{container.company}</p><p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600"><Phone size={14} />+91 22 4378 2100 <Mail size={14} className="ml-2" />ops@bluewave.io</p></div><button onClick={onViewBookings} className="mt-6 w-full rounded-xl bg-navy py-3 text-sm font-bold text-white">View my bookings</button></div>}</motion.div></div>;
}

function Trader({ tab, onNavigate }: { tab: DashboardTab; onNavigate: (tab: DashboardTab) => void }) {
  const [term, setTerm] = useState("");
  const [booking, setBooking] = useState<Container | null>(null);
  const [market, setMarket] = useState<Container[]>(containers);
  const [bookings, setBookings] = useState<Booking[]>([{ id: "BK-2048", route: "Mumbai → Rotterdam", boxes: 12, amount: 552, status: "In transit" }]);
  const load = async () => { try { const supabase = getSupabaseBrowserClient(); const { data, error } = await supabase.from("containers").select("id,origin,destination,departure_date,price_per_box,total_boxes,occupied_boxes,status").eq("status", "active").order("departure_date"); if (error || !data?.length) return; setMarket(data.map(item => ({ id: item.id, route: `${item.origin} → ${item.destination}`, origin: item.origin, destination: item.destination, departure: new Date(item.departure_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }), price: Number(item.price_per_box), capacity: item.total_boxes, occupied: item.occupied_boxes, company: "Verified provider", vessel: "CargoConnect fleet", verified: true }))); } catch {} };
  useEffect(() => { load(); }, []);
  const visible = useMemo(() => market.filter(item => `${item.route} ${item.origin} ${item.destination}`.toLowerCase().includes(term.toLowerCase())), [term, market]);
  const handleBooked = (container: Container, boxes: number) => { setMarket(current => current.map(item => item.id === container.id ? { ...item, occupied: item.occupied + boxes } : item)); setBookings(current => [{ id: `BK-${String(Date.now()).slice(-5)}`, route: container.route, boxes, amount: boxes * container.price, status: "Confirmed" }, ...current]); };

  if (tab === "Bookings") return <section><p className="text-sm text-slate-500">Every confirmed cargo reservation in one place.</p><h2 className="mt-1 text-3xl font-bold text-navy">My bookings</h2><div className="mt-8 space-y-4">{bookings.map(item => <article key={item.id} className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center"><div><p className="text-xs font-bold text-sky">{item.id}</p><h3 className="mt-1 text-lg font-bold text-navy">{item.route}</h3><p className="mt-1 text-sm text-slate-500">{item.boxes} boxes · ${item.amount}</p></div><span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">{item.status}</span></article>)}</div></section>;

  const showAll = tab === "Containers";
  return <section><div className="flex flex-col justify-between gap-4 md:flex-row"><div><p className="text-sm text-slate-500">{showAll ? "Search active routes and reserve spare capacity." : "Find a route that fits your cargo."}</p><h2 className="mt-1 text-3xl font-bold text-navy">{showAll ? "All containers" : "Available capacity"}</h2></div><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm"><Search size={18} className="text-slate-400" /><input value={term} onChange={event => setTerm(event.target.value)} placeholder="Origin, destination…" className="w-56 py-3 text-sm font-medium text-black outline-none" /></div></div>{!showAll && <div className="mt-7 grid gap-4 md:grid-cols-3"><Stat label="Active bookings" value={String(bookings.length).padStart(2, "0")} icon={TrendingUp} detail="Confirmed cargo spaces" /><Stat label="Cargo booked" value={`${bookings.reduce((sum, item) => sum + item.boxes, 0)} boxes`} icon={Users} detail="Ready for departure" /><Stat label="Amount saved" value="$1,820" icon={CircleDollarSign} detail="vs. full container load" /></div>}<div className="mt-10 grid gap-5 lg:grid-cols-3">{visible.map(item => <ContainerCard key={item.id} container={item} onBook={setBooking} />)}</div>{visible.length === 0 && <p className="mt-10 rounded-2xl bg-white p-8 text-center text-slate-500">No active routes match that search.</p>}<AnimatePresence>{booking && <BookingModal container={booking} onClose={() => setBooking(null)} onBooked={boxes => handleBooked(booking, boxes)} onViewBookings={() => { setBooking(null); onNavigate("Bookings"); }} />}</AnimatePresence></section>;
}

function Admin({ tab }: { tab: DashboardTab }) {
  if (tab === "Containers") return <section><p className="text-sm text-slate-500">Marketplace inventory across all approved providers.</p><h2 className="mt-1 text-3xl font-bold text-navy">Container registry</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{containers.map(item => <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-xs font-bold text-sky">{item.id}</p><h3 className="mt-1 font-bold text-navy">{item.route}</h3><p className="mt-3 text-sm text-slate-500">{item.occupied}/{item.capacity} boxes occupied · ${item.price}/box</p></article>)}</div></section>;
  if (tab === "Bookings") return <section><p className="text-sm text-slate-500">Platform-wide transaction monitoring.</p><h2 className="mt-1 text-3xl font-bold text-navy">Booking activity</h2><div className="mt-8 rounded-2xl bg-white p-6 shadow-sm"><p className="font-bold text-navy">Today’s marketplace health</p><p className="mt-3 text-sm text-slate-500">18 confirmed bookings · $12,460 total booking value · no payment exceptions</p></div></section>;
  return <section><p className="text-sm text-slate-500">Platform health at a glance.</p><h2 className="mt-1 text-3xl font-bold text-navy">Command center</h2><div className="mt-7 grid gap-4 md:grid-cols-4"><Stat label="Total users" value="2,846" icon={Users} detail="↑ 9.8% this month" /><Stat label="Active containers" value="128" icon={ShipWheel} detail="24 new this week" /><Stat label="Gross bookings" value="$124k" icon={CircleDollarSign} detail="↑ 14.2% this month" /><Stat label="Pending reviews" value="1" icon={TrendingUp} detail="Provider applications" /></div><div className="mt-8 rounded-3xl bg-white p-6 shadow-sm"><p className="font-bold text-navy">Provider verification queue</p><div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 p-4"><div><p className="font-bold text-navy">BlueWave Logistics</p><p className="mt-1 text-xs text-slate-500">Submitted Jul 19 · Mumbai, India</p></div><button className="rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white">Approve</button></div></div></section>;
}

export function Dashboard({ role }: { role: Role }) {
  return <AppShell role={role}>{(tab, onNavigate) => role === "trader" ? <Trader tab={tab} onNavigate={onNavigate} /> : <Admin tab={tab} />}</AppShell>;
}
