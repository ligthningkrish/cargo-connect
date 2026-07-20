"use client";
import { motion } from "framer-motion";
export function CargoShip({ sailing = false }: { sailing?:boolean }) { return <motion.div animate={sailing ? {x:[0,30,260], y:[0,-4,0]} : {y:[0,-7,0]}} transition={sailing ? {duration:2.8, ease:"easeInOut"} : {repeat:Infinity, duration:3, ease:"easeInOut"}} className="relative w-72">
  <div className="absolute -bottom-5 left-0 h-8 w-72 rounded-[50%] bg-sky/20 blur-md" />
  <div className="flex justify-center gap-1 px-12"><i className="h-9 w-11 rounded-t bg-orange"/><i className="h-12 w-11 rounded-t bg-sky"/><i className="h-8 w-11 rounded-t bg-navy"/><i className="h-11 w-11 rounded-t bg-orange"/></div>
  <div className="ship-hull h-16 bg-navy"><div className="mx-auto h-3 w-20 rounded-b bg-sky"/></div>
  <div className="mx-auto h-3 w-52 rounded-b-full bg-[#0a4775]"/>
</motion.div> }
