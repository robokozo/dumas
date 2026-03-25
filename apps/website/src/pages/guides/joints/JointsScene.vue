<script setup lang="ts">
import { GameObject } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
import Pendulum from "./Pendulum.vue";
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 4, 14]" :look-at="[0, 3.5, 0]" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1" />

    <Pendulum />
  </GameObject>
</template>
