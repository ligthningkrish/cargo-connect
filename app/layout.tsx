import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "CargoConnect | Shared Container Space", description: "The intelligent marketplace for available container capacity." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
