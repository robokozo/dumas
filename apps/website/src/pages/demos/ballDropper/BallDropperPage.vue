<script setup lang="ts">
import { ref } from "vue";
import SiteCanvas from "../../../components/SiteCanvas.vue";
import DemoLayout from "../layout/DemoLayout.vue";
import BallDropperScene from "./BallDropperScene.vue";

const TOTAL_BALLS = 100;

const BOWLS = [
  { color: "#ff3333", points: 100 },
  { color: "#ffffff", points: 10 },
] as const;

const score = ref(0);
const ballsRemaining = ref(TOTAL_BALLS);
const dropTrigger = ref(0);
const resetKey = ref(0);

function onDrop(): void {
  if (ballsRemaining.value <= 0) return;
  dropTrigger.value += 1;
}

function onScore(points: number): void {
  score.value += points;
}

function onBallUsed(): void {
  ballsRemaining.value = Math.max(0, ballsRemaining.value - 1);
}

function reset(): void {
  score.value = 0;
  ballsRemaining.value = TOTAL_BALLS;
  resetKey.value += 1;
}
</script>

<template>
  <DemoLayout>
    <template #scene>
      <div class="scene-wrapper" @pointerdown="onDrop">
        <SiteCanvas clear-color="#0a0a14" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
          <BallDropperScene
            :balls-remaining="ballsRemaining"
            :drop-trigger="dropTrigger"
            :reset-key="resetKey"
            @score="(pts) => onScore(pts)"
            @ball-used="onBallUsed"
          />
        </SiteCanvas>
      </div>
    </template>

    <template #hud>
      <div class="hud">
        <div class="panel">
          <span class="label">Score</span>
          <span class="value">{{ score.toLocaleString() }}</span>
        </div>
        <div class="panel">
          <span class="label">Balls</span>
          <span class="value" :class="{ depleted: ballsRemaining === 0 }">{{
            ballsRemaining
          }}</span>
        </div>
        <button class="reset-btn" @click.stop="reset">Reset</button>
      </div>

      <div class="legend">
        <div v-for="(bowl, i) in BOWLS" :key="i" class="legend-item">
          <span class="legend-dot" :style="{ background: bowl.color }" />
          <span class="legend-pts">{{ bowl.points }}pt</span>
        </div>
      </div>

      <p class="hint">Click anywhere to drop a ball</p>
    </template>
  </DemoLayout>
</template>

<style scoped>
.scene-wrapper {
  height: 100%;
  width: 100%;
  cursor: crosshair;
}

.hud {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  pointer-events: none;
  font-family: sans-serif;
}

.panel {
  background: rgba(5, 5, 20, 0.75);
  border: 1px solid rgba(120, 120, 255, 0.2);
  border-radius: 9px;
  padding: 0.7rem 1rem;
  min-width: 130px;
}

.label {
  display: block;
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(160, 160, 255, 0.55);
  margin-bottom: 0.15rem;
}

.value {
  display: block;
  font-size: 1.7rem;
  font-weight: 700;
  color: #ddeeff;
  line-height: 1.1;
}

.value.depleted {
  color: #ff6655;
}

.reset-btn {
  pointer-events: auto;
  background: rgba(5, 5, 20, 0.75);
  border: 1px solid rgba(120, 120, 255, 0.3);
  border-radius: 7px;
  color: rgba(180, 180, 255, 0.7);
  font-family: sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.reset-btn:hover {
  background: rgba(80, 80, 200, 0.2);
  border-color: rgba(120, 120, 255, 0.6);
  color: #aabbff;
}

.legend {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  pointer-events: none;
  font-family: sans-serif;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-pts {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
}

.hint {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  color: rgba(255, 255, 255, 0.2);
  font-family: sans-serif;
  font-size: 0.72rem;
  white-space: nowrap;
  pointer-events: none;
}
</style>
