<script setup lang="ts">
import { GameObject } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 3, 8]" :look-at="[0, 1, 0]" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />

    <GameObject :position="{ x: 0, y: 2, z: 0 }">
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#4af" />
      </TresMesh>
    </GameObject>

    <GameObject
      :position="{ x: 3, y: 1, z: 0 }"
      :rotation="{ x: 0, y: 0, z: 0.3826834, w: 0.9238795 }"
      :scale="{ x: 0.8, y: 0.8, z: 0.8 }"
    >
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#f4a" />
      </TresMesh>
    </GameObject>

    <GameObject :position="{ x: -3, y: 0.5, z: 0 }" :scale="{ x: 1.2, y: 1.2, z: 1.2 }">
      <TresMesh>
        <TresSphereGeometry :args="[0.5, 32, 32]" />
        <TresMeshStandardMaterial color="#4fa" />
      </TresMesh>
    </GameObject>
  </GameObject>
</template>
