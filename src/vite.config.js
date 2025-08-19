// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // required for Replit
    port: 3000,      // Replit expects port 3000
    allowedHosts: [
      // allow your Replit preview host dynamically
      ".replit.dev",
      ".pike.replit.dev"
    ],
  },
  base: "./", // makes it work later on GitHub Pages too
});
