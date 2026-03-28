<script setup lang="ts">
import { inject } from "vue";
import { useSystem, Transform } from "@dumas/core";
import { WAVE_REGISTRY_KEY } from "./waveRegistry";

const WAVE_SPEED = 2.5;
const WAVE_AMPLITUDE = 1.5;
const SPIN_SPEED = 1.2;

const registry = inject(WAVE_REGISTRY_KEY);

useSystem({
  components: [Transform],
  fn: ({ entities, elapsed, delta }) => {
    for (const eid of entities) {
      const entry = registry?.get(eid);
      if (entry === null || entry === undefined) continue;
      Transform.posY[eid] = Math.sin(elapsed * WAVE_SPEED + entry.phase) * WAVE_AMPLITUDE;
      Transform.rotY[eid] += delta * SPIN_SPEED;
      entry.posY.value = Transform.posY[eid];
      entry.rotY.value = Transform.rotY[eid];
    }
  },
});
</script>

<template><!-- headless: drives wave animation via useSystem shorthand --></template>
