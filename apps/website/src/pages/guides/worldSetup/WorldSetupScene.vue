<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
import { World, Scene } from "@dumas/core";
import SpinningCube from "./SpinningCube.vue";
</script>

<template>
  <World style="width: 100%; height: 100%">
    <Scene name="main">
      <TresPerspectiveCamera :position="[4, 3, 6]" :look-at="[0, 0, 0]" />
      <OrbitControls />

      <TresDirectionalLight :position="[5, 8, 5]" :intensity="2" />
      <TresAmbientLight :intensity="0.4" />

      <SpinningCube />
    </Scene>
  </World>
</template>
