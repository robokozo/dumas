<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useTres } from "@tresjs/core";
import { Color } from "three";

const props = defineProps<{
  color: [number, number, number];
}>();

const { scene } = useTres();

// Set background on mount and whenever the component re-mounts after a scene switch
onMounted(() => {
  scene.value.background = new Color(...props.color);
});

// Also react to color prop changes
watch(
  () => props.color,
  (next) => {
    scene.value.background = new Color(...next);
  },
);

// Intentionally no cleanup on unmount: the next scene will set its own background.
// Cleaning up here would cause a black flash between scene transitions.
</script>

<template>
  <slot />
</template>
