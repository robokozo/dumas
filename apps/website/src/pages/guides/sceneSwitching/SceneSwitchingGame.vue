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

      <template #overlay>
        <div class="scene-label">Forest</div>
      </template>
    </Scene>

    <Scene name="desert">
      <TresPerspectiveCamera :position="[0, 2, 6]" :look-at="[0, 0, 0]" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="2" />
      <TresAmbientLight :intensity="0.4" />
      <TresMesh>
        <TresSphereGeometry :args="[0.8, 32, 32]" />
        <TresMeshStandardMaterial color="#f44336" />
      </TresMesh>

      <template #overlay>
        <div class="scene-label">Desert</div>
      </template>
    </Scene>

    <template #overlay>
      <SceneControls />
    </template>
  </Game>
</template>

<style scoped>
.scene-label {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
}
</style>
