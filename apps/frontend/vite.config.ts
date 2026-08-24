import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    allowedHosts: ["perps.mindraw.in"],
    hmr: {
      protocol: "wss",
      host: "perps.mindraw.in",
      clientPort: 443,
    },
  },
});
