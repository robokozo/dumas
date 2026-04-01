<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Scene, useGame } from "@dumas/core";
import DungeonCharacter from "../shared/DungeonCharacter.vue";

const { loadScene, transitionState, activeScene } = useGame();

const spawnX = computed(() => {
  const from = transitionState.value.from as string | undefined;
  if (from === "cave") return 4;
  return 0;
});
const spawnZ = computed(() => {
  const from = transitionState.value.from as string | undefined;
  if (from === "cave") return -2;
  return 2;
});

const camX = ref(spawnX.value);
const camZ = ref(spawnZ.value);

watch(activeScene, (scene) => {
  if (scene === "forest") {
    camX.value = spawnX.value;
    camZ.value = spawnZ.value;
  }
});

function onPlayerMoved({ x, z }: { x: number; z: number }): void {
  camX.value = x;
  camZ.value = z;

  // Walk into cave entrance → transition
  const dx = x - 4.5;
  const dz = z - -5;
  if (Math.sqrt(dx * dx + dz * dz) < 1.0) {
    void loadScene({ name: "cave" });
  }
}
</script>

<template>
  <Scene name="forest" :default="true">
    <TresPerspectiveCamera :position="[camX, 12, camZ + 8]" :look-at="[camX, 0, camZ]" :fov="40" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.2" color="#fff8e0" />
    <TresDirectionalLight :position="[-4, 6, -3]" :intensity="0.3" color="#aaddff" />

    <!-- Ground -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[20, 20]" />
      <TresMeshStandardMaterial color="#2a4a1a" />
    </TresMesh>

    <!-- Path to cave -->
    <TresMesh :position="[4.5, 0.01, -2]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[2, 6]" />
      <TresMeshStandardMaterial color="#5a4a30" />
    </TresMesh>

    <!-- Cave entrance — stone arch -->
    <TresGroup :position="[4.5, 0, -5]">
      <!-- Left pillar -->
      <TresMesh :position="[-0.9, 0.8, 0]">
        <TresBoxGeometry :args="[0.5, 1.6, 0.6]" />
        <TresMeshStandardMaterial color="#606068" />
      </TresMesh>
      <!-- Right pillar -->
      <TresMesh :position="[0.9, 0.8, 0]">
        <TresBoxGeometry :args="[0.5, 1.6, 0.6]" />
        <TresMeshStandardMaterial color="#606068" />
      </TresMesh>
      <!-- Arch top -->
      <TresMesh :position="[0, 1.8, 0]">
        <TresBoxGeometry :args="[2.3, 0.5, 0.6]" />
        <TresMeshStandardMaterial color="#555560" />
      </TresMesh>
      <!-- Dark interior -->
      <TresMesh :position="[0, 0.7, -0.2]">
        <TresBoxGeometry :args="[1.3, 1.4, 0.3]" />
        <TresMeshStandardMaterial color="#0a0a10" />
      </TresMesh>
    </TresGroup>

    <!-- Trees -->
    <TresGroup
      v-for="(t, i) in [
        [-3, -3],
        [-6, 1],
        [2, 4],
        [-5, -5],
        [7, -2],
        [-2, 5],
        [6, 4],
      ]"
      :key="i"
      :position="[t[0], 0, t[1]]"
    >
      <TresMesh :position="[0, 0.6, 0]">
        <TresCylinderGeometry :args="[0.12, 0.16, 1.2, 6]" />
        <TresMeshStandardMaterial color="#5a3a20" />
      </TresMesh>
      <TresMesh :position="[0, 1.7, 0]">
        <TresConeGeometry :args="[0.75, 1.6, 7]" />
        <TresMeshStandardMaterial color="#1a4a20" />
      </TresMesh>
    </TresGroup>

    <!-- Rocks -->
    <TresMesh :position="[-1, 0.15, -1]" :rotation="[0.2, 0.5, 0.1]">
      <TresBoxGeometry :args="[0.45, 0.3, 0.4]" />
      <TresMeshStandardMaterial color="#505058" />
    </TresMesh>
    <TresMesh :position="[3, 0.12, 2]" :rotation="[0.1, 1.0, 0.2]">
      <TresBoxGeometry :args="[0.35, 0.24, 0.35]" />
      <TresMeshStandardMaterial color="#484850" />
    </TresMesh>

    <DungeonCharacter :start-x="spawnX" :start-z="spawnZ" @moved="(pos) => onPlayerMoved(pos)" />

    <template #overlay>
      <div class="location">Forest Clearing</div>
      <div class="hint">WASD / Left Stick to move &nbsp;·&nbsp; Walk into the cave</div>
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
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

.hint {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: sans-serif;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  white-space: nowrap;
}
</style>
