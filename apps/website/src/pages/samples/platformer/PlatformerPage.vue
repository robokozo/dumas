<script setup lang="ts">
import { ref } from "vue";
import { DumasCanvas } from "@dumas/core";
import SampleLayout from "../layout/SampleLayout.vue";
import PlatformerScene from "./PlatformerScene.vue";

const TOTAL_COINS = 5;
const score = ref(0);

function onCollect(): void {
  score.value++;
}
</script>

<template>
  <SampleLayout>
    <template #scene>
      <DumasCanvas clear-color="#1a1a2e" render-mode="always" :gravity="{ x: 0, y: -20, z: 0 }">
        <PlatformerScene
          @collect="
            () => {
              onCollect();
            }
          "
        />
      </DumasCanvas>
    </template>
    <template #hud>
      <div class="hud">
        <div class="score">
          <span class="score-label">Coins</span>
          <span class="score-value">{{ score }} / {{ TOTAL_COINS }}</span>
        </div>
        <p class="controls">WASD / Arrows to move &middot; Space to jump</p>
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

.score {
  display: inline-flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  font-family: sans-serif;
}

.score-label {
  font-size: 0.65rem;
  color: rgba(255, 215, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
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
