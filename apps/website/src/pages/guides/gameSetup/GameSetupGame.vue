<script setup lang="ts">
import { Game, Scene } from "@dumas/core";
</script>

<template>
  <Game style="width: 100%; height: 100%">
    <Scene name="main" :default="true">
      <TresPerspectiveCamera :position="[0, 2, 6]" :look-at="[0, 0, 0]" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="2" />
      <TresAmbientLight :intensity="0.4" />

      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#4ecdc4" />
      </TresMesh>
    </Scene>
  </Game>
</template>
