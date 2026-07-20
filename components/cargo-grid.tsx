"use client";
import { motion } from "framer-motion";

export function CargoGrid({ occupied, capacity = 100, compact = false }: { occupied:number; capacity?:number; compact?:boolean }) {
  return <div className="space-y-3">
    <div className="flex items-end justify-between"><div><span className="text-2xl font-bold text-navy">{occupied}</span><span className="text-sm text-slate-500"> / {capacity} boxes occupied</span></div><span className="rounded-full bg-sky/10 px-3 py-1 text-xs font-bold text-sky">{Math.round(occupied/capacity*100)}% filled</span></div>
    <div className={`grid grid-cols-10 gap-1.5 ${compact ? "max-w-[220px]" : ""}`}>
      {Array.from({length:capacity}, (_, i) => <motion.div key={i} className={`container-box ${i < occupied ? "bg-sky shadow-sm" : "bg-slate-200"}`} initial={{scale:.65, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:i*.008, duration:.22}} />)}
    </div>
    <div className="flex gap-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-sky"/> Occupied</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-slate-200"/> Available</span></div>
  </div>
}
