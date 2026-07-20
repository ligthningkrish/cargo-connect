import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { navy: "#062B4F", sky: "#49B8F3", orange: "#FF8A3D", ink: "#102A43" }, boxShadow: { glow: "0 24px 60px rgba(21, 105, 163, .18)" } } }, plugins: [] };
export default config;
