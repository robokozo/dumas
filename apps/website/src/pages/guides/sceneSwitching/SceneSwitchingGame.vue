<script setup lang="ts">
import { Game, Scene } from "@dumas/core";
import SceneControls from "./SceneControls.vue";
</script>

<template>
  <Game style="width: 100%; height: 100%">
    <Scene name="forest" :default="true">
      <TresPerspectiveCamera :position="[0, 2, 6]" :look-at="[0, 0, 0]" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="2" />
      <TresAmbientLight :intensity="0.4" />
      <TresMesh>
        <TresBoxGeometry :args="[1.2, 1.2, 1.2]" />
        <TresMeshStandardMaterial color="#2196f3" />
      </TresMesh>
    </Scene>

    <Scene name="desert">
      <TresPerspectiveCamera :position="[0, 2, 6]" :look-at="[0, 0, 0]" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="2" />
      <TresAmbientLight :intensity="0.4" />
      <TresMesh>
        <TresSphereGeometry :args="[0.8, 32, 32]" />
        <TresMeshStandardMaterial color="#f44336" />
      </TresMesh>
    </Scene>

    <template #overlay>
      <SceneControls />
    </template>
  </Game>
</template>
