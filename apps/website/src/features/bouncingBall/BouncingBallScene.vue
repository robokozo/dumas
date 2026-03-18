<script setup lang="ts">
import { useWorld } from "@dumas/core";
import { useControls } from "@tresjs/leches";
import { OrbitControls } from "@tresjs/cientos";

useControls({ fps: { type: "fpsgraph" } });
import Ball from "./Ball.vue";
import Ball2 from "./Ball2.vue";
import Ball3 from "./Ball3.vue";
import Ground from "./Ground.vue";

useWorld({ gravity: { x: 0, y: -9.81, z: 0 } });
</script>

<template>
  <TresPerspectiveCamera :position="[0, 5, 10]" :look-at="[0, 0, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
  <Ground />
  <Ball />
  <Ball2 />
  <Ball3 />
</template>
