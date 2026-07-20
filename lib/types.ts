export type Role = "trader" | "provider" | "admin";
export type Container = { id:string; route:string; origin:string; destination:string; departure:string; price:number; capacity:number; occupied:number; company:string; vessel:string; verified?:boolean };
export const containers: Container[] = [
 {id:"CC-1024", route:"Mumbai → Rotterdam", origin:"Mumbai", destination:"Rotterdam", departure:"Aug 18, 2026", price:46, capacity:100, occupied:34, company:"BlueWave Logistics", vessel:"MV Atlantic Star", verified:true},
 {id:"CC-1089", route:"Chennai → Singapore", origin:"Chennai", destination:"Singapore", departure:"Aug 23, 2026", price:38, capacity:100, occupied:62, company:"Pacific Link", vessel:"MV Meridian", verified:true},
 {id:"CC-1102", route:"Mumbai → Dubai", origin:"Mumbai", destination:"Dubai", departure:"Aug 27, 2026", price:29, capacity:100, occupied:18, company:"OceanGate Freight", vessel:"MV Desert Pearl"}
];
