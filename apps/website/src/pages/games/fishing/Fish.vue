<script setup lang="ts">
import { DumasEntity, useEcsComponent, useSystem } from "@dumas/core";
import type { FishSpecies } from "./fishTypes";

const props = defineProps<{
  species: FishSpecies;
  startX: number;
  direction: number;
}>();

const SWIM_RANGE = 8;
const BOB_AMPLITUDE = 0.15;
const BOB_FREQUENCY = 1.5;

const { eid, transform } = useEcsComponent({ components: {} });

transform.posX.value = props.startX;
transform.posY.value = props.species.depth;

useSystem({
  fn: ({ elapsed }) => {
    // Swim back and forth using a sine wave offset by startX
    const offset = props.startX + props.direction * elapsed * props.species.speed;
    const wrapX = ((offset % (SWIM_RANGE * 2)) + SWIM_RANGE * 2) % (SWIM_RANGE * 2);
    const pingPongX = wrapX < SWIM_RANGE ? wrapX - SWIM_RANGE / 2 : SWIM_RANGE * 1.5 - wrapX;

    transform.posX.value = pingPongX;

    // Gentle vertical bob
    transform.posY.value =
      props.species.depth + Math.sin(elapsed * BOB_FREQUENCY + props.startX) * BOB_AMPLITUDE;
  },
});

/**
 * fishX / fishY are plain getters so the scene can read current position
 * without importing the transform store.
 */
defineExpose({
  eid,
  species: props.species,
  get fishX() {
    return transform.posX.value;
  },
  get fishY() {
    return transform.posY.value;
  },
});
</script>

<template>
  <DumasEntity :eid="eid">
    <!-- Fish body (elongated sphere) -->
    <TresMesh :scale="[1.8, 0.8, 0.6]">
      <TresSphereGeometry :args="[species.size, 12, 8]" />
      <TresMeshStandardMaterial
        :color="species.color"
        :emissive="species.color"
        :emissive-intensity="0.15"
      />
    </TresMesh>
    <!-- Tail fin -->
    <TresMesh :position="[-species.size * 1.5, 0, 0]" :scale="[0.6, 1, 0.4]">
      <TresConeGeometry :args="[species.size * 0.5, species.size * 0.8, 4]" />
      <TresMeshStandardMaterial :color="species.color" />
    </TresMesh>
  </DumasEntity>
</template>
