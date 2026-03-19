import { templateCompilerOptions } from "@tresjs/core";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/dumas/",
  plugins: [
    vue({
      ...templateCompilerOptions,
    }),
  ],
  resolve: {
    alias: {},
    dedupe: ["vue", "three"],
  },
});
