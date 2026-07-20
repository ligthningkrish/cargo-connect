import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import type { Role } from "@/lib/types";
export default async function DashboardPage({params}:{params:Promise<{role:string}>}) { const {role}=await params; if(!["trader","provider","admin"].includes(role)) notFound(); return <Dashboard role={role as Role}/>; }
