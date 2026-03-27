import { templateCompilerOptions } from "@tresjs/core";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    plugins: [vue({ ...templateCompilerOptions })],
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
