<script setup lang="ts">
import { provide } from "vue";
import { useGameLoop } from "../composables/useGameLoop";
import { DUMAS_CONTEXT_KEY } from "../keys";
import type { DumasContext } from "../types";

const props = defineProps<{
  ctx: DumasContext;
}>();

useGameLoop({ ctx: props.ctx });
provide(DUMAS_CONTEXT_KEY, props.ctx);
</script>

<template>
  <slot v-if="ctx.isReady.value" />
</template>
