<script setup lang="ts">
import { Float32BufferAttribute, BufferGeometry } from "three";

const STAR_COUNT = 600;
const SPREAD = 80;

const positions = new Float32Array(STAR_COUNT * 3);

for (let i = 0; i < STAR_COUNT; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * SPREAD;
  positions[i3 + 1] = (Math.random() - 0.5) * SPREAD;
  positions[i3 + 2] = -10 - Math.random() * 40;
}

const geometry = new BufferGeometry();
geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
</script>

<template>
  <!-- Dim background stars -->
  <TresPoints :geometry="geometry">
    <TresPointsMaterial
      color="#ffffff"
      :size="0.08"
      :size-attenuation="true"
      :transparent="true"
      :opacity="0.6"
    />
  </TresPoints>
</template>
