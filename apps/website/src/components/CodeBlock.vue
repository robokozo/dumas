<script lang="ts">
import { createHighlighter } from "shiki";

// Singleton — created once per module load, shared across all instances.
const highlighterPromise = createHighlighter({
  themes: ["github-dark"],
  langs: ["vue"],
});
</script>

<script setup lang="ts">
import { computedAsync } from "@vueuse/core";

const props = defineProps<{
  code: string;
  lang: string;
}>();

const html = computedAsync(async () => {
  const hl = await highlighterPromise;
  return hl.codeToHtml(props.code, { lang: props.lang, theme: "github-dark" });
}, "");
</script>

<template>
  <!-- v-html is safe: code originates from our own bundled source files, not user input -->
  <div v-html="html" class="code-block" />
</template>

<style scoped>
.code-block :deep(pre) {
  margin: 0;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.8rem;
  line-height: 1.6;
}

.code-block :deep(code) {
  font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
}
</style>
