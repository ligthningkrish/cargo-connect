import { NextResponse } from "next/server";

const guide = (question:string, role:string) => {
  const q=question.toLowerCase();
  if(q.includes("book")||q.includes("cargo space")) return "Start in Containers, choose a route, then select Book space. Pick your box count, confirm the payment step, and your provider details unlock immediately.";
  if(q.includes("provider")||q.includes("company")) return "Providers create a company profile, add a container draft, and wait for Admin approval. Once approved, their spare capacity can accept trader bookings.";
  if(q.includes("payment")||q.includes("pay")) return "Payments are currently demonstrated with a confirmation step. In production, connect this step to Stripe or your preferred payment provider before marking the booking as paid.";
  if(q.includes("chat")||q.includes("message")||q.includes("contact")) return "Use Messages in the sidebar to chat. Contact details remain private until a booking is confirmed, then both parties can coordinate directly.";
  if(q.includes("admin")||q.includes("approve")) return "Admin Console is where you review logistics providers, approve or reject applications, and monitor marketplace activity and utilization.";
  if(q.includes("container")||q.includes("occupancy")||q.includes("box")) return "Each container uses a 100-box visual map. Blue boxes are occupied; grey boxes are available. Hover any box to see its status and route details.";
  return `I’m CargoGuide, your CargoConnect navigator. As a ${role}, I can help you find cargo space, explain booking and payments, guide provider setup, or explain the dashboard. What would you like to do?`;
};

export async function POST(request:Request){
  const {message,role="trader"}=await request.json() as {message?:string;role?:string};
  if(!message?.trim()) return NextResponse.json({answer:"Ask me anything about CargoConnect.",mode:"guided"});
  if(!process.env.OPENAI_API_KEY) return NextResponse.json({answer:guide(message,role),mode:"guided"});
  try {
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:"gpt-4.1-mini",input:[{role:"system",content:`You are CargoGuide, a concise and friendly in-product assistant for CargoConnect, a logistics marketplace. The user role is ${role}. Explain only supported CargoConnect flows: trader searches containers, books boxes, unlocks contacts after payment; providers create container drafts pending admin approval; admins approve or reject providers. Never invent shipment status, payments, rates, or company details. Give practical next steps in 2-4 short sentences.`},{role:"user",content:message}]})});
    if(!response.ok) throw new Error("AI request failed");
    const data=await response.json() as {output?:Array<{type?:string;content?:Array<{type?:string;text?:string}>}>};
    const answer=data.output?.find(item=>item.type==="message")?.content?.find(item=>item.type==="output_text")?.text;
    return NextResponse.json({answer:answer||guide(message,role),mode:"ai"});
  } catch { return NextResponse.json({answer:guide(message,role),mode:"guided"}); }
}
