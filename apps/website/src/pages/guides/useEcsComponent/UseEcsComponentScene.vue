<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
import { World, Scene } from "@dumas/core";
import OrbitingCube from "./OrbitingCube.vue";

interface Column {
  startX: number;
  color: string;
  phase: number;
}

const COLUMN_COUNT = 7;
const TWO_PI = 2 * Math.PI;

const COLUMNS: Array<Column> = [
  { startX: -4.5, color: "#ff6b6b", phase: 0 },
  { startX: -3, color: "#ff8e53", phase: TWO_PI / COLUMN_COUNT },
  { startX: -1.5, color: "#ffe66d", phase: (TWO_PI * 2) / COLUMN_COUNT },
  { startX: 0, color: "#88ff88", phase: (TWO_PI * 3) / COLUMN_COUNT },
  { startX: 1.5, color: "#4ecdc4", phase: (TWO_PI * 4) / COLUMN_COUNT },
  { startX: 3, color: "#44aaff", phase: (TWO_PI * 5) / COLUMN_COUNT },
  { startX: 4.5, color: "#c9b1ff", phase: (TWO_PI * 6) / COLUMN_COUNT },
];
</script>

<template>
  <World style="width: 100%; height: 100%">
    <Scene name="main">
      <TresPerspectiveCamera :position="[0, 3, 12]" :look-at="[0, 0, 0]" />
      <OrbitControls />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="2" />
      <TresAmbientLight :intensity="0.4" />

      <OrbitingCube
        v-for="col in COLUMNS"
        :key="col.startX"
        :start-x="col.startX"
        :color="col.color"
        :phase="col.phase"
      />
    </Scene>
  </World>
</template>
