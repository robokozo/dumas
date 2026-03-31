<script setup lang="ts">
import { BUILD_OPTIONS } from "./types";

const props = defineProps<{
  energy: number;
  incomePerSecond: number;
  costs: Array<number>;
}>();

const emit = defineEmits<{
  build: [{ index: number }];
}>();
</script>

<template>
  <div class="hud">
    <div class="energy-display">
      <span class="energy-value">{{ Math.floor(energy) }}</span>
      <span class="energy-label">Energy</span>
      <span v-if="incomePerSecond > 0" class="income">+{{ incomePerSecond }}/s</span>
    </div>

    <div class="build-menu">
      <button
        v-for="(option, i) in BUILD_OPTIONS"
        :key="option.type"
        class="build-btn"
        :class="{ disabled: energy < props.costs[i] }"
        @click.stop="() => emit('build', { index: i })"
      >
        <span class="btn-label">{{ option.label }}</span>
        <span class="btn-cost">{{ props.costs[i] }} E</span>
        <span class="btn-income">+{{ option.energyPerSecond }}/s</span>
      </button>
    </div>
  </div>

  <div class="click-hint">Click the sun to harvest energy</div>
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

.energy-display {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.energy-value {
  font-family: monospace;
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffcc44;
  text-shadow: 0 0 8px rgba(255, 204, 68, 0.5);
}

.energy-label {
  font-family: sans-serif;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.income {
  font-family: monospace;
  font-size: 0.75rem;
  color: #88cc44;
}

.build-menu {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  pointer-events: auto;
}

.build-btn {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  color: #ddd;
  font-family: sans-serif;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  text-align: left;
  min-width: 140px;
}

.build-btn:hover:not(.disabled) {
  background: rgba(255, 204, 68, 0.12);
  border-color: rgba(255, 204, 68, 0.3);
}

.build-btn.disabled {
  opacity: 0.35;
  cursor: default;
}

.btn-label {
  font-size: 0.7rem;
  font-weight: 600;
}

.btn-cost {
  font-size: 0.6rem;
  color: #ffcc44;
}

.btn-income {
  font-size: 0.55rem;
  color: #88cc44;
}

.click-hint {
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
</style>
