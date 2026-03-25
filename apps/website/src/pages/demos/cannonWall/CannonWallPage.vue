<script setup lang="ts">
import SiteCanvas from "../../../components/SiteCanvas.vue";
import SampleLayout from "../layout/SampleLayout.vue";
import CannonWallScene from "./CannonWallScene.vue";
</script>

<template>
  <SampleLayout>
    <template #scene>
      <SiteCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
        <CannonWallScene />
      </SiteCanvas>
    </template>
    <template #hud>
      <p class="hint">Click to fire</p>
    </template>
  </SampleLayout>
</template>

<style scoped>
.hint {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.35);
  font-family: sans-serif;
  font-size: 0.8rem;
  pointer-events: none;
  user-select: none;
}
</style>
