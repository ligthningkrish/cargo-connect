"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export function CargoGrid({ occupied, capacity = 100, compact = false }: { occupied:number; capacity?:number; compact?:boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return <div className="space-y-3">
    <div className="flex items-end justify-between"><div><span className="text-2xl font-bold text-navy">{occupied}</span><span className="text-sm text-slate-500"> / {capacity} boxes occupied</span></div><span className="rounded-full bg-sky/10 px-3 py-1 text-xs font-bold text-sky">{Math.round(occupied/capacity*100)}% filled</span></div>
    <div className={`relative grid grid-cols-10 gap-1.5 ${compact ? "max-w-[220px]" : ""}`}>
      {Array.from({length:capacity}, (_, i) => <motion.button key={i} type="button" aria-label={i < occupied ? `Booked cargo box ${i + 1}` : `Available cargo box ${i + 1}`} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} className={`container-box cursor-crosshair border-0 ${i < occupied ? "bg-sky shadow-sm" : "bg-slate-200"}`} initial={{scale:.65, opacity:0}} animate={{scale:1, opacity:1}} whileHover={{scale:1.5, zIndex:2, backgroundColor:i < occupied ? "#F2994A" : "#b8d8f5"}} transition={{delay:i*.008, duration:.22}} />)}
      {hovered !== null && <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className="pointer-events-none absolute -top-20 left-0 z-10 w-52 rounded-xl bg-navy p-3 text-[10px] text-white shadow-xl"><p className="font-bold">Box {hovered + 1} · {hovered < occupied ? "On board" : "Available"}</p><p className="mt-1 text-white/70">{hovered < occupied ? "Owner: Northwind Exports · 18 kg" : "Reserve this space for your cargo"}</p><p className="mt-1 text-sky">Destination: Rotterdam</p></motion.div>}
    </div>
    <div className="flex gap-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-sky"/> Occupied</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-slate-200"/> Available</span></div>
  </div>
}
