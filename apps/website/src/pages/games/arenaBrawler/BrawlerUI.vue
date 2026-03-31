<script setup lang="ts">
import type { GameState } from "./types";
import { PLAYER_MAX_HEALTH, ENEMY_MAX_HEALTH } from "./constants";

interface HealthBarData {
  screenX: number;
  screenY: number;
  isVisible: boolean;
  current: number;
  max: number;
  label: string;
  color: string;
}

const props = defineProps<{
  gameState: GameState;
  playerHealth: number;
  healthBars: Array<HealthBarData>;
  enemiesRemaining: number;
}>();

const emit = defineEmits<{
  restart: [];
}>();
</script>

<template>
  <!-- HUD — top bar -->
  <div class="hud-top">
    <div class="hud-stat">
      <span class="hud-label">HP</span>
      <div class="hud-bar-track">
        <div
          class="hud-bar-fill hud-bar-fill--player"
          :style="{ width: (playerHealth / PLAYER_MAX_HEALTH) * 100 + '%' }"
        />
      </div>
      <span class="hud-value">{{ playerHealth }}</span>
    </div>
    <div class="hud-stat">
      <span class="hud-label">Enemies</span>
      <span class="hud-value hud-value--enemies">{{ enemiesRemaining }}</span>
    </div>
  </div>

  <!-- Floating health bars -->
  <div
    v-for="(bar, i) in healthBars"
    :key="i"
    class="floating-bar"
    :class="{ 'floating-bar--hidden': bar.isVisible === false }"
    :style="{
      left: bar.screenX + 'px',
      top: bar.screenY - 20 + 'px',
    }"
  >
    <div class="floating-bar-track">
      <div
        class="floating-bar-fill"
        :style="{
          width: (bar.current / bar.max) * 100 + '%',
          background: bar.color,
        }"
      />
    </div>
  </div>

  <!-- Controls hint -->
  <div class="controls-hint">
    <span class="hint-key">WASD</span> Move
    <span class="hint-sep">|</span>
    <span class="hint-key">Space</span> Attack
  </div>

  <!-- Game over / victory overlay -->
  <div v-if="gameState !== 'playing'" class="overlay">
    <div class="overlay-content">
      <h2 :class="gameState === 'victory' ? 'text-victory' : 'text-defeat'">
        {{ gameState === "victory" ? "Victory!" : "Defeated" }}
      </h2>
      <p class="overlay-sub">
        {{ gameState === "victory" ? "All enemies vanquished." : "You have fallen in battle." }}
      </p>
      <button class="restart-btn" @click.stop="() => emit('restart')">Play Again</button>
    </div>
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
  align-items: flex-start;
  pointer-events: none;
}

.hud-stat {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hud-label {
  font-family: sans-serif;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hud-bar-track {
  width: 120px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.hud-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.15s;
}

.hud-bar-fill--player {
  background: #4488ff;
}

.hud-value {
  font-family: monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.hud-value--enemies {
  color: #ff6644;
  font-size: 1rem;
  font-weight: bold;
}

.floating-bar {
  position: absolute;
  transform: translateX(-50%);
  pointer-events: none;
  transition: opacity 0.1s;
}

.floating-bar--hidden {
  opacity: 0;
}

.floating-bar-track {
  width: 40px;
  height: 4px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 2px;
  overflow: hidden;
}

.floating-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.1s;
}

.controls-hint {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: sans-serif;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.hint-key {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.6rem;
}

.hint-sep {
  color: rgba(255, 255, 255, 0.1);
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  pointer-events: auto;
}

.overlay-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.overlay-content h2 {
  font-family: sans-serif;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.text-victory {
  color: #44dd88;
  text-shadow: 0 0 12px rgba(68, 221, 136, 0.5);
}

.text-defeat {
  color: #ff4444;
  text-shadow: 0 0 12px rgba(255, 68, 68, 0.5);
}

.overlay-sub {
  font-family: sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.restart-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  color: #ddd;
  font-family: sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.restart-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.4);
}
</style>
