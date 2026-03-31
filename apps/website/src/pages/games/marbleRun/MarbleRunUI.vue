<script setup lang="ts">
interface CheckpointDisplay {
  label: string;
  screenX: number;
  screenY: number;
  isVisible: boolean;
  isReached: boolean;
}

const props = defineProps<{
  score: number;
  elapsedTime: number;
  marbleCount: number;
  maxMarbles: number;
  checkpoints: Array<CheckpointDisplay>;
}>();

function formatTime({ seconds }: { seconds: number }): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${ms}`;
}
</script>

<template>
  <!-- Score and timer -->
  <div class="hud-top">
    <div class="hud-score">
      <span class="hud-label">SCORE</span>
      <span class="hud-value">{{ score }}</span>
    </div>
    <div class="hud-timer">
      <span class="hud-label">TIME</span>
      <span class="hud-value hud-value--time">{{ formatTime({ seconds: elapsedTime }) }}</span>
    </div>
  </div>

  <!-- Marble counter -->
  <div class="hud-marbles">
    <span class="hud-label">MARBLES</span>
    <span class="hud-marble-count">{{ marbleCount }} / {{ maxMarbles }}</span>
  </div>

  <!-- Checkpoint screen labels -->
  <div
    v-for="(cp, i) in checkpoints"
    :key="i"
    v-show="cp.isVisible === true"
    class="checkpoint-label"
    :class="{ 'checkpoint-label--reached': cp.isReached === true }"
    :style="{
      left: cp.screenX + 'px',
      top: cp.screenY - 28 + 'px',
    }"
  >
    {{ cp.label }}
    <span v-if="cp.isReached === true" class="checkpoint-check">[ok]</span>
  </div>

  <!-- Controls hint -->
  <div class="controls-hint">
    <span>Space to drop marble</span>
  </div>
</template>

<style scoped>
.hud-top {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.hud-score,
.hud-timer {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.hud-timer {
  align-items: flex-end;
}

.hud-label {
  font-family: sans-serif;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
}

.hud-value {
  font-family: monospace;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffd700;
  line-height: 1;
}

.hud-value--time {
  color: #4ecdc4;
  font-size: 1.4rem;
}

.hud-marbles {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  pointer-events: none;
}

.hud-marble-count {
  font-family: monospace;
  font-size: 1rem;
  color: #ff6b6b;
}

.checkpoint-label {
  position: absolute;
  transform: translateX(-50%);
  pointer-events: none;
  font-family: monospace;
  font-size: 0.7rem;
  color: #4488ff;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(68, 136, 255, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.checkpoint-label--reached {
  color: #44ff44;
  border-color: rgba(68, 255, 68, 0.3);
}

.checkpoint-check {
  margin-left: 0.25rem;
}

.controls-hint {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  font-family: sans-serif;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}
</style>
