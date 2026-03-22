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

    <GameObject :position="[0, 2, 0]">
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#4af" />
      </TresMesh>
    </GameObject>

    <GameObject
      :position="[3, 1, 0]"
      :rotation="[0, 0, 0.3826834, 0.9238795]"
      :scale="[0.8, 0.8, 0.8]"
    >
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#f4a" />
      </TresMesh>
    </GameObject>

    <GameObject :position="[-3, 0.5, 0]" :scale="[1.2, 1.2, 1.2]">
      <TresMesh>
        <TresSphereGeometry :args="[0.5, 32, 32]" />
        <TresMeshStandardMaterial color="#4fa" />
      </TresMesh>
    </GameObject>
  </GameObject>
</template>
