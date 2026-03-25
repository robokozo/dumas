<script setup lang="ts">
import { ref, watch } from "vue";
import { codeToHtml } from "shiki/bundle/web";

const props = withDefaults(
  defineProps<{
    code: string;
    lang?: string;
  }>(),
  { lang: "vue" },
);

const highlightedHtml = ref<string>("");
const isLoaded = ref<boolean>(false);

async function highlight(): Promise<void> {
  const html = await codeToHtml(props.code, {
    lang: props.lang,
    theme: "vitesse-dark",
  });
  highlightedHtml.value = html;
  isLoaded.value = true;
}

highlight();

watch(
  () => props.code,
  () => {
    highlight();
  },
);
</script>

<template>
  <div class="code-block">
    <div v-if="isLoaded" v-html="highlightedHtml" />
    <pre v-else class="fallback"><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.85rem;
  line-height: 1.6;
}

.code-block :deep(pre) {
  padding: 1rem;
  overflow-x: auto;
  margin: 0;
}

.fallback {
  background: #1e1e1e;
  color: #ccc;
  padding: 1rem;
  overflow-x: auto;
  margin: 0;
}
</style>
