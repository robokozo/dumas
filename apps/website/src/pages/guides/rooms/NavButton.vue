<script setup lang="ts">
import { useGame } from "@dumas/core";

const { to } = defineProps<{ to: string }>();

const { loadScene } = useGame();

function go(): void {
  void loadScene({ name: to });
}
</script>

<template>
  <button class="nav-btn" @click="go()"><slot /></button>
</template>

<style scoped>
.nav-btn {
  min-width: 2.2rem;
  height: 2.2rem;
  padding: 0 0.4rem;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(210, 170, 70, 0.35);
  color: rgba(210, 170, 70, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(210, 170, 70, 0.15);
  color: rgba(235, 195, 95, 1);
  border-color: rgba(210, 170, 70, 0.6);
}
</style>
