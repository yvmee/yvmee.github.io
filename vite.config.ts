import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { contentUpdated } from "./build/content-updated.ts"
import { contentPlugin } from "./build/vite-plugin-content.ts"

// https://vite.dev/config/
export default defineConfig({
  plugins: [contentPlugin(), react(), tailwindcss()],
  define: {
    __CONTENT_UPDATED__: JSON.stringify(contentUpdated()),
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
})
