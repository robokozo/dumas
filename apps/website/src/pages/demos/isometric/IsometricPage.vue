<script setup lang="ts">
import { ref } from "vue";
import SiteCanvas from "../../../components/SiteCanvas.vue";
import DemoLayout from "../layout/DemoLayout.vue";
import IsometricScene from "./IsometricScene.vue";

const TOTAL_COLLECTIBLES = 5;
const score = ref(0);
</script>

<template>
  <DemoLayout>
    <template #scene>
      <SiteCanvas clear-color="#1a2a1a" render-mode="always">
        <IsometricScene
          @update:score="
            (s) => {
              score = s;
            }
          "
        />
      </SiteCanvas>
    </template>
    <template #hud>
      <div class="hud">
        <div class="counter">
          <span class="counter-label">Collected</span>
          <span class="counter-value">{{ score }} / {{ TOTAL_COLLECTIBLES }}</span>
        </div>
        <p class="controls">
          Click the ground to move &middot; Walk over orange spheres to collect
        </p>
      </div>
    </template>
  </DemoLayout>
</template>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  padding: 1.5rem;
  pointer-events: none;
}

.counter {
  display: inline-flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(100, 200, 100, 0.3);
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  font-family: sans-serif;
}

.counter-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(100, 200, 100, 0.7);
}

.counter-value {
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
