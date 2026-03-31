<script setup lang="ts">
import { Float32BufferAttribute, BufferGeometry } from "three";
import { STAR_COUNT, STAR_SPREAD } from "./constants";

const positions = new Float32Array(STAR_COUNT * 3);

for (let i = 0; i < STAR_COUNT; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * STAR_SPREAD;
  positions[i3 + 1] = -2;
  positions[i3 + 2] = (Math.random() - 0.5) * STAR_SPREAD;
}

const geometry = new BufferGeometry();
geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
</script>

<template>
  <TresPoints :geometry="geometry">
    <TresPointsMaterial
      color="#ffffff"
      :size="0.06"
      :size-attenuation="true"
      :transparent="true"
      :opacity="0.5"
    />
  </TresPoints>
</template>
