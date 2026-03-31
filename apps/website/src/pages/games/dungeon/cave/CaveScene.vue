<script setup lang="ts">
import { ref, computed } from "vue";
import { Scene, useGame, useScene } from "@dumas/core";
import DungeonCharacter from "../shared/DungeonCharacter.vue";

const { loadScene, transitionState } = useGame();
const { onSceneEnter } = useScene();

const spawnX = computed(() => {
  const from = transitionState.value.from as string | undefined;
  if (from === "forest") return 0;
  return 0;
});
const spawnZ = computed(() => {
  const from = transitionState.value.from as string | undefined;
  if (from === "forest") return 4;
  return 0;
});

const camX = ref(spawnX.value);
const camZ = ref(spawnZ.value);

onSceneEnter(() => {
  camX.value = spawnX.value;
  camZ.value = spawnZ.value;
});

function onPlayerMoved({ x, z }: { x: number; z: number }): void {
  camX.value = x;
  camZ.value = z;

  // Walk to cave exit → back to forest
  const dx = x - 0;
  const dz = z - 5;
  if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
    void loadScene({ name: "forest" });
  }
}
</script>

<template>
  <Scene name="cave">
    <TresPerspectiveCamera :position="[camX, 10, camZ + 7]" :look-at="[camX, 0, camZ]" :fov="40" />
    <TresAmbientLight :intensity="0.12" />

    <!-- Torch lights -->
    <TresPointLight :position="[-3, 1.5, 0]" :intensity="6" :distance="6" color="#ff8830" />
    <TresPointLight :position="[3, 1.5, -2]" :intensity="6" :distance="6" color="#ff8830" />
    <TresPointLight :position="[0, 1.5, -5]" :intensity="4" :distance="5" color="#ff6620" />

    <!-- Cave floor -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[14, 14]" />
      <TresMeshStandardMaterial color="#1a1818" />
    </TresMesh>

    <!-- Walls — irregular rock shapes -->
    <!-- Back wall -->
    <TresMesh :position="[0, 0.8, -6]">
      <TresBoxGeometry :args="[14, 2, 1.5]" />
      <TresMeshStandardMaterial color="#2a2428" />
    </TresMesh>
    <!-- Left wall -->
    <TresMesh :position="[-6, 0.8, -0.5]">
      <TresBoxGeometry :args="[1.5, 2, 12]" />
      <TresMeshStandardMaterial color="#282224" />
    </TresMesh>
    <!-- Right wall -->
    <TresMesh :position="[6, 0.8, -0.5]">
      <TresBoxGeometry :args="[1.5, 2, 12]" />
      <TresMeshStandardMaterial color="#2c2628" />
    </TresMesh>
    <!-- Front wall left of exit -->
    <TresMesh :position="[-3.5, 0.8, 5.5]">
      <TresBoxGeometry :args="[6, 2, 1.5]" />
      <TresMeshStandardMaterial color="#282224" />
    </TresMesh>
    <!-- Front wall right of exit -->
    <TresMesh :position="[3.5, 0.8, 5.5]">
      <TresBoxGeometry :args="[6, 2, 1.5]" />
      <TresMeshStandardMaterial color="#282224" />
    </TresMesh>

    <!-- Exit arch -->
    <TresGroup :position="[0, 0, 5.5]">
      <TresMesh :position="[-0.8, 1.6, 0]">
        <TresBoxGeometry :args="[0.4, 0.5, 1.5]" />
        <TresMeshStandardMaterial color="#3a3438" />
      </TresMesh>
      <TresMesh :position="[0.8, 1.6, 0]">
        <TresBoxGeometry :args="[0.4, 0.5, 1.5]" />
        <TresMeshStandardMaterial color="#3a3438" />
      </TresMesh>
      <!-- Light coming from outside -->
      <TresPointLight :position="[0, 1, 1]" :intensity="4" :distance="4" color="#aaddaa" />
    </TresGroup>

    <!-- Stalagmites -->
    <TresMesh :position="[-2, 0.35, -3]">
      <TresConeGeometry :args="[0.2, 0.7, 5]" />
      <TresMeshStandardMaterial color="#3a3438" />
    </TresMesh>
    <TresMesh :position="[4, 0.25, -1]">
      <TresConeGeometry :args="[0.15, 0.5, 5]" />
      <TresMeshStandardMaterial color="#383238" />
    </TresMesh>
    <TresMesh :position="[-4, 0.3, 2]">
      <TresConeGeometry :args="[0.18, 0.6, 5]" />
      <TresMeshStandardMaterial color="#363036" />
    </TresMesh>

    <!-- Treasure chest in the back -->
    <TresGroup :position="[0, 0, -4.5]">
      <TresMesh :position="[0, 0.2, 0]">
        <TresBoxGeometry :args="[0.7, 0.38, 0.5]" />
        <TresMeshStandardMaterial color="#7a5020" />
      </TresMesh>
      <TresMesh :position="[0, 0.49, 0]">
        <TresBoxGeometry :args="[0.7, 0.2, 0.5]" />
        <TresMeshStandardMaterial color="#8a6030" />
      </TresMesh>
      <TresMesh :position="[0, 0.37, 0.26]">
        <TresBoxGeometry :args="[0.12, 0.1, 0.04]" />
        <TresMeshStandardMaterial color="#f0c040" :emissive="'#c09010'" :emissive-intensity="0.5" />
      </TresMesh>
    </TresGroup>

    <!-- Torch meshes on walls -->
    <TresMesh :position="[-3, 1.2, -0.1]">
      <TresCylinderGeometry :args="[0.04, 0.06, 0.4, 4]" />
      <TresMeshStandardMaterial color="#6a4a20" />
    </TresMesh>
    <TresMesh :position="[3, 1.2, -2.1]">
      <TresCylinderGeometry :args="[0.04, 0.06, 0.4, 4]" />
      <TresMeshStandardMaterial color="#6a4a20" />
    </TresMesh>

    <DungeonCharacter :start-x="spawnX" :start-z="spawnZ" @moved="(pos) => onPlayerMoved(pos)" />

    <template #overlay>
      <div class="location">Dark Cave</div>
      <div class="hint">Find the exit to return to the forest</div>
    </template>
  </Scene>
</template>

<style scoped>
.location {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-family: sans-serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.hint {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: sans-serif;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.15);
  pointer-events: none;
  white-space: nowrap;
}
</style>
