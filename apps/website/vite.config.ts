import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/dumas/",
  plugins: [vue()],
  resolve: {
    alias: {},
    dedupe: ["vue", "three"],
  },
});
