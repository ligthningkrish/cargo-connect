import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { navy: "#0B1F3A", sky: "#2F80ED", orange: "#F2994A", ink: "#102A43" }, boxShadow: { glow: "0 24px 60px rgba(21, 105, 163, .18)" } } }, plugins: [] };
export default config;
