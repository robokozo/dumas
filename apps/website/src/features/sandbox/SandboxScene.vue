<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
</script>

<template>
  <TresPerspectiveCamera :position="[3, 3, 3]" :look-at="[0, 0, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
  <TresMesh>
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresMeshStandardMaterial color="#4af" />
  </TresMesh>
</template>
