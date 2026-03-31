<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { Scene, useSystem } from "@dumas/core";
import type { DebrisConfig } from "./types";
import {
  INITIAL_DEBRIS_COUNT,
  SPAWN_RADIUS,
  MIN_TUMBLE_SPEED,
  MAX_TUMBLE_SPEED,
  DEBRIS_COLORS,
  MIN_DEBRIS_SIZE,
  MAX_DEBRIS_SIZE,
  POINTS_PER_DEBRIS,
  CAMERA_HEIGHT,
  WAVE_SIZE,
  WAVE_INTERVAL,
} from "./constants";
import Starfield from "./Starfield.vue";
import SpaceShip from "./SpaceShip.vue";
import Debris from "./Debris.vue";
import SpaceDebrisUI from "./SpaceDebrisUI.vue";

const DEBRIS_TYPES = ["rock", "panel", "hull", "crystal"] as const;

let nextId = 1;

function createDebrisConfig(): DebrisConfig {
  const angle = Math.random() * Math.PI * 2;
  const radius = 2 + Math.random() * (SPAWN_RADIUS - 2);
  const type = DEBRIS_TYPES[Math.floor(Math.random() * DEBRIS_TYPES.length)];

  return {
    id: nextId++,
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    size: MIN_DEBRIS_SIZE + Math.random() * (MAX_DEBRIS_SIZE - MIN_DEBRIS_SIZE),
    color: DEBRIS_COLORS[type],
    tumbleSpeedX: MIN_TUMBLE_SPEED + Math.random() * (MAX_TUMBLE_SPEED - MIN_TUMBLE_SPEED),
    tumbleSpeedY: MIN_TUMBLE_SPEED + Math.random() * (MAX_TUMBLE_SPEED - MIN_TUMBLE_SPEED),
    tumbleSpeedZ: MIN_TUMBLE_SPEED + Math.random() * (MAX_TUMBLE_SPEED - MIN_TUMBLE_SPEED),
    type,
  };
}

const debrisList = shallowRef<Array<DebrisConfig>>(
  Array.from({ length: INITIAL_DEBRIS_COUNT }, () => createDebrisConfig()),
);

const score = ref(0);
const wave = ref(1);
const shipEid = shallowRef<number | null>(null);
const isTractorActive = shallowRef(false);
const collectedFlash = shallowRef(0);

let waveTimer = 0;

const shipRef = shallowRef<InstanceType<typeof SpaceShip> | null>(null);

useSystem({
  fn: ({ delta }) => {
    // Fade out collected flash
    if (collectedFlash.value > 0) {
      collectedFlash.value = Math.max(0, collectedFlash.value - delta * 3);
    }

    // Read tractor state from ship component
    if (shipRef.value !== null) {
      isTractorActive.value = shipRef.value.isTractorActive === true;
    }

    // Wave spawning
    waveTimer += delta;
    if (waveTimer >= WAVE_INTERVAL) {
      waveTimer = 0;
      wave.value += 1;
      const newDebris = Array.from({ length: WAVE_SIZE }, () => createDebrisConfig());
      debrisList.value = [...debrisList.value, ...newDebris];
    }
  },
});

function onShipPositionUpdate({ eid }: { x: number; z: number; eid: number }): void {
  if (shipEid.value === null) {
    shipEid.value = eid;
  }
}

function onDebrisCollected({ id }: { id: number }): void {
  score.value += POINTS_PER_DEBRIS;
  collectedFlash.value = 1;
  debrisList.value = debrisList.value.filter((d) => d.id !== id);
}
</script>

<template>
  <Scene name="spaceDebris" :default="true">
    <TresPerspectiveCamera :position="[0, CAMERA_HEIGHT, 0.01]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.3" />
    <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.5" />

    <Starfield />

    <SpaceShip ref="shipRef" @position-update="(evt) => onShipPositionUpdate(evt)" />

    <Debris
      v-for="debris in debrisList"
      :key="debris.id"
      :config="debris"
      :ship-eid="shipEid"
      :is-tractor-active="isTractorActive"
      @collected="(evt) => onDebrisCollected(evt)"
    />

    <template #overlay>
      <SpaceDebrisUI
        :score="score"
        :debris-remaining="debrisList.length"
        :wave="wave"
        :collected-flash="collectedFlash"
      />
    </template>
  </Scene>
</template>
