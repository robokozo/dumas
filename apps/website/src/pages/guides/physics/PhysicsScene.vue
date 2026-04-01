<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
import {
  Scene,
  useEcsComponent,
  usePhysics,
  createPhysics,
  createCuboidCollider,
} from "@dumas/core";
import PhysicsBox from "./PhysicsBox.vue";

interface Box {
  id: number;
  position: [number, number, number];
  color: string;
}

/** Maximum random offset applied to each cube's x and z starting position. */
const POSITION_JITTER_RANGE = 1.5;

function randomJitter(): number {
  return (Math.random() - 0.5) * POSITION_JITTER_RANGE;
}

function jitterPosition({
  position,
}: {
  position: [number, number, number];
}): [number, number, number] {
  return [position[0] + randomJitter(), position[1], position[2] + randomJitter()];
}

const BOX_TEMPLATES: Array<{ id: number; position: [number, number, number]; color: string }> = [
  { id: 1, position: [-4, 3, 0.5], color: "#ff6b6b" },
  { id: 2, position: [-2.5, 6, -0.5], color: "#ff8e53" },
  { id: 3, position: [-1, 9, 0.3], color: "#ffe66d" },
  { id: 4, position: [-0.8, 14, 0.2], color: "#4ecdc4" },
  { id: 5, position: [2, 15, 0.4], color: "#a8e6cf" },
  { id: 6, position: [3.5, 18, -0.2], color: "#c9b1ff" },
  { id: 7, position: [-3, 4, 1.2], color: "#ff6b9d" },
  { id: 8, position: [1, 8, -1.2], color: "#44aaff" },
  { id: 9, position: [3, 11, 1], color: "#88ff88" },
];

const BOXES: Array<Box> = BOX_TEMPLATES.map((template) => ({
  ...template,
  position: jitterPosition({ position: template.position }),
}));

usePhysics({ gravity: [0, -9.81, 0] });

// Ground — fixed body, no visual entity needed (static TresMesh below handles rendering)
useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        ground: createCuboidCollider({ halfExtents: [10, 0.1, 10] }),
      },
    }),
  },
});
</script>

<template>
  <Scene name="main" :default="true">
    <TresPerspectiveCamera :position="[0, 10, 22]" :look-at="[0, 5, 0]" />
    <OrbitControls />
    <TresDirectionalLight :position="[5, 10, 5]" :intensity="2" />
    <TresAmbientLight :intensity="0.5" />

    <!-- Static ground slab — visual only, physics handled by the fixed body above -->
    <TresMesh :position="[0, -0.1, 0]">
      <TresBoxGeometry :args="[20, 0.2, 20]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <PhysicsBox v-for="box in BOXES" :key="box.id" :position="box.position" :color="box.color" />
  </Scene>
</template>
