<script setup lang="ts">
import { GameObject } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
import SpinningBox from "./SpinningBox.vue";
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 3, 8]" :look-at="[0, 2, 0]" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1" />

    <SpinningBox />
  </GameObject>
</template>
