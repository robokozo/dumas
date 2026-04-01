<script setup lang="ts">
import { ref } from "vue";
import { Scene, usePointer, useSystem } from "@dumas/core";
import type { Mesh } from "three";

const CUBE_POSITIONS = [
  { x: -3, y: 1.5, z: 0 },
  { x: 0, y: -1, z: -1 },
  { x: 2.5, y: 0.5, z: 1 },
  { x: -1, y: 2, z: -2 },
  { x: 3, y: -1.5, z: -1 },
] as const;

const DEFAULT_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"] as const;

const cubeColors = ref<Array<string>>(DEFAULT_COLORS.map((c) => c));
const cubeRefs = ref<Array<Mesh | null>>(Array.from({ length: CUBE_POSITIONS.length }, () => null));

const HIT_COLOR = "#ffffff";

const pointer = usePointer();

const ndcDisplay = ref({ x: 0, y: 0 });

useSystem({
  fn: () => {
    ndcDisplay.value = {
      x: Math.round(pointer.ndcX.value * 100) / 100,
      y: Math.round(pointer.ndcY.value * 100) / 100,
    };

    if (pointer.isPressed.value === true) {
      const meshes = cubeRefs.value.filter((m): m is Mesh => m !== null);
      const hits = pointer.raycast({ objects: meshes });

      if (hits.length > 0) {
        const hitObject = hits[0].object;
        const index = cubeRefs.value.indexOf(hitObject as Mesh);
        if (index !== -1) {
          cubeColors.value[index] =
            cubeColors.value[index] === HIT_COLOR ? DEFAULT_COLORS[index] : HIT_COLOR;
        }
      }
    }
  },
});

function setCubeRef({ index, el }: { index: number; el: Mesh | null }): void {
  cubeRefs.value[index] = el;
}
</script>

<template>
  <Scene name="pointer-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 1, 10]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 5, 5]" :intensity="1.2" />

    <TresMesh
      v-for="(pos, i) in CUBE_POSITIONS"
      :key="i"
      :ref="(el: unknown) => setCubeRef({ index: i, el: el as Mesh | null })"
      :position="[pos.x, pos.y, pos.z]"
      :rotation="[0.4 * i, 0.6 * i, 0]"
    >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="cubeColors[i]" />
    </TresMesh>

    <template #overlay>
      <div class="overlay">
        <span>NDC: ({{ ndcDisplay.x }}, {{ ndcDisplay.y }})</span>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  padding: 0.4rem 0.8rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  color: #eee;
  font-family: monospace;
  font-size: 0.85rem;
  pointer-events: none;
}
</style>
