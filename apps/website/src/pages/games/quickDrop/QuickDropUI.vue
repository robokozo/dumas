<script setup lang="ts">
import { MAX_BALLS } from "./types";

const props = defineProps<{
  score: number;
  highScore: number;
  lastDrop: number | null;
  isHolding: boolean;
  ballCount: number;
}>();

const emit = defineEmits<{
  holdStart: [];
  holdEnd: [];
}>();
</script>

<template>
  <div class="hud">
    <div class="score-display">
      <span class="score-value">{{ props.score }}</span>
      <span class="score-label">Score</span>
      <span v-if="props.highScore > 0" class="high-score">Best: {{ props.highScore }}</span>
    </div>

    <div class="drop-area">
      <div class="ball-counter">{{ props.ballCount }} / {{ MAX_BALLS }}</div>
      <button
        class="drop-btn"
        :class="{ active: props.isHolding }"
        @pointerdown.prevent="() => emit('holdStart')"
        @pointerup.prevent="() => emit('holdEnd')"
        @pointerleave="() => emit('holdEnd')"
      >
        {{ props.isHolding ? "Dropping..." : "Hold to Drop" }}
      </button>
    </div>
  </div>

  <div v-if="props.lastDrop !== null" class="last-drop">+{{ props.lastDrop }}</div>
  <div class="hint">Click &amp; hold anywhere to drop balls — release and wait for scoring</div>
</template>

<style scoped>
.hud {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 3.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
}

.score-display {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.score-value {
  font-family: monospace;
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.score-label {
  font-family: sans-serif;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.high-score {
  font-family: monospace;
  font-size: 0.7rem;
  color: rgba(255, 204, 68, 0.6);
}

.drop-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.ball-counter {
  font-family: monospace;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.drop-btn {
  pointer-events: auto;
  background: rgba(68, 200, 120, 0.2);
  border: 1px solid rgba(68, 200, 120, 0.4);
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  color: #44cc78;
  font-family: sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.drop-btn:hover:not(.active) {
  background: rgba(68, 200, 120, 0.35);
  border-color: rgba(68, 200, 120, 0.6);
}

.drop-btn.active {
  background: rgba(68, 200, 120, 0.45);
  border-color: rgba(68, 200, 120, 0.8);
  box-shadow: 0 0 12px rgba(68, 200, 120, 0.3);
}

.last-drop {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: monospace;
  font-size: 2rem;
  font-weight: bold;
  color: #ffcc44;
  text-shadow: 0 0 12px rgba(255, 204, 68, 0.6);
  pointer-events: none;
  animation: fadeUp 1.5s ease-out forwards;
}

@keyframes fadeUp {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -100%);
  }
}

.hint {
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
