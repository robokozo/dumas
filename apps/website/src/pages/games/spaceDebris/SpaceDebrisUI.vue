<script setup lang="ts">
import { POINTS_PER_DEBRIS } from "./constants";

const props = defineProps<{
  score: number;
  debrisRemaining: number;
  wave: number;
  collectedFlash: number;
}>();
</script>

<template>
  <div class="hud">
    <div class="hud__stats">
      <div class="stat">
        <span class="stat__value">{{ props.score }}</span>
        <span class="stat__label">Score</span>
      </div>
      <div class="stat">
        <span class="stat__value">{{ props.debrisRemaining }}</span>
        <span class="stat__label">Debris</span>
      </div>
      <div class="stat">
        <span class="stat__value">{{ props.wave }}</span>
        <span class="stat__label">Wave</span>
      </div>
    </div>

    <!-- Collected flash indicator -->
    <div
      v-if="props.collectedFlash > 0"
      class="collected-flash"
      :style="{ opacity: props.collectedFlash }"
    >
      +{{ POINTS_PER_DEBRIS }}
    </div>
  </div>

  <div class="controls-hint">
    <span>WASD</span> move
    <span class="sep">|</span>
    <span>Space / Click</span> tractor beam
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
}

.hud__stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.stat__value {
  font-family: monospace;
  font-size: 1.4rem;
  font-weight: bold;
  color: #44ffaa;
  text-shadow: 0 0 8px rgba(68, 255, 170, 0.4);
}

.stat__label {
  font-family: sans-serif;
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.collected-flash {
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: bold;
  color: #44ffaa;
  text-shadow: 0 0 8px rgba(68, 255, 170, 0.6);
  pointer-events: none;
}

.controls-hint {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: sans-serif;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.15);
  pointer-events: none;
  white-space: nowrap;
}

.controls-hint span {
  font-family: monospace;
  color: rgba(255, 255, 255, 0.3);
}

.sep {
  margin: 0 0.3rem;
}
</style>
