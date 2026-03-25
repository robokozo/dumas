<script setup lang="ts">
import { ref } from "vue";
import { DumasCanvas } from "@dumas/core";
import SampleLayout from "../layout/SampleLayout.vue";
import PlatformerScene from "./PlatformerScene.vue";

const TOTAL_COINS = 5;
const score1 = ref(0);
const score2 = ref(0);
</script>

<template>
  <SampleLayout>
    <template #scene>
      <DumasCanvas clear-color="#1a1a2e" render-mode="always" :gravity="{ x: 0, y: -20, z: 0 }">
        <PlatformerScene
          @update:score1="
            (s) => {
              score1 = s;
            }
          "
          @update:score2="
            (s) => {
              score2 = s;
            }
          "
        />
      </DumasCanvas>
    </template>
    <template #hud>
      <div class="hud">
        <div class="scores">
          <div class="score score--p1">
            <span class="score-label">P1 Coins</span>
            <span class="score-value">{{ score1 }} / {{ TOTAL_COINS }}</span>
          </div>
          <div class="score score--p2">
            <span class="score-label">P2 Coins</span>
            <span class="score-value">{{ score2 }} / {{ TOTAL_COINS }}</span>
          </div>
        </div>
        <p class="controls">P1: WASD + W to jump &middot; P2: Arrows + ↑ to jump</p>
      </div>
    </template>
  </SampleLayout>
</template>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  padding: 1.5rem;
  pointer-events: none;
}

.scores {
  display: flex;
  gap: 0.75rem;
}

.score {
  display: inline-flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  font-family: sans-serif;
}

.score--p1 {
  border: 1px solid rgba(68, 170, 255, 0.4);
}

.score--p2 {
  border: 1px solid rgba(255, 68, 68, 0.4);
}

.score-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.score--p1 .score-label {
  color: rgba(68, 170, 255, 0.7);
}

.score--p2 .score-label {
  color: rgba(255, 68, 68, 0.7);
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffd700;
  line-height: 1.2;
}

.controls {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.3);
  font-family: sans-serif;
  font-size: 0.75rem;
  white-space: nowrap;
  margin: 0;
}
</style>
