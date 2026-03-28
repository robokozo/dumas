<script setup lang="ts">
import { useGame } from "@dumas/core";

const { loadScene, activeScene, scenes } = useGame();
</script>

<template>
  <div class="controls">
    <button
      v-for="scene in scenes"
      :key="scene"
      class="btn"
      :class="{ active: activeScene === scene }"
      style="pointer-events: auto"
      @click="() => loadScene({ name: scene })"
    >
      {{ scene }}
    </button>
  </div>
</template>

<style scoped>
.controls {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.4rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.5);
  color: #eee;
  font-size: 0.85rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition:
    background 0.15s,
    border-color 0.15s;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn.active {
  border-color: #4af;
  color: #4af;
}
</style>
