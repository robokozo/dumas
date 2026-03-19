<script setup lang="ts">
import { useWorld } from "../composables/useWorld";
import type { WorldOptions } from "../types";

const props = defineProps<WorldOptions>();

const ctx = useWorld(props);
const isReady = ctx.isReady;

defineExpose({ isReady });
</script>

<template>
  <slot v-if="isReady" />
</template>
