<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
import MageCharacter from "./MageCharacter.vue";
import KnightCharacter from "./KnightCharacter.vue";

const GROUND_ROTATION_X = -Math.PI / 2;
</script>

<template>
  <TresPerspectiveCamera :position="[0, 2.5, 6]" :look-at="[0, 2, -0.5]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[3, 8, 5]" :intensity="1.5" cast-shadow />
  <TresDirectionalLight :position="[-3, 4, -4]" :intensity="0.3" />

  <TresMesh :rotation="[GROUND_ROTATION_X, 0, 0]">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial color="#222" />
  </TresMesh>

  <MageCharacter :position="[-1, 0, 0]" />
  <KnightCharacter :position="[1, 0, 0]" />
</template>
