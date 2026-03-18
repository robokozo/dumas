import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    plugins: [vue()],
    dts: false,
    exports: false,
  },
  lint: {
    options: {
      typeAware: true,
    },
  },
  fmt: {},
});
