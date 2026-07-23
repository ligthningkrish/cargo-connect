import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { ProviderLive } from "@/components/provider-live";
import type { Role } from "@/lib/types";
export default async function DashboardPage({params}:{params:Promise<{role:string}>}) { const {role}=await params; if(!["trader","provider","admin"].includes(role)) notFound(); if(role==="provider") return <ProviderLive/>; return <Dashboard role={role as Role}/>; }
