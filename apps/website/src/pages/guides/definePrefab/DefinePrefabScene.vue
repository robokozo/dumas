<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
import {
  Scene,
  DumasEntity,
  useEcsComponent,
  usePhysics,
  usePrefab,
  definePrefab,
  createPhysics,
  createSphereCollider,
  createCuboidCollider,
} from "@dumas/core";

// ─── Prefab definition (module-level reusable template) ─────────────────────

const OrbPrefab = definePrefab({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        sphere: createSphereCollider({ radius: 0.5, restitution: 0.7 }),
      },
    }),
  },
  defaults({ transform }) {
    transform.posY.value = 5;
  },
});

// ─── Orb config ─────────────────────────────────────────────────────────────

interface OrbConfig {
  startY: number;
  posX: number;
  color: string;
}

const ORB_CONFIGS: Array<OrbConfig> = [
  { startY: 6, posX: -2, color: "#ff6b6b" },
  { startY: 10, posX: 0, color: "#4ecdc4" },
  { startY: 14, posX: 2, color: "#c9b1ff" },
];

// ─── Scene setup ────────────────────────────────────────────────────────────

usePhysics({ gravity: [0, -2, 0] });

// Ground — fixed body, no DumasEntity needed (static TresMesh handles rendering)
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

// Spawn 3 orbs from the same prefab, each with a different starting height
const orbs = ORB_CONFIGS.map((config) => {
  const result = usePrefab(OrbPrefab);
  result.transform.posX.value = config.posX;
  result.transform.posY.value = config.startY;
  return { ...result, color: config.color };
});
</script>

<template>
  <Scene name="main" :default="true">
    <TresPerspectiveCamera :position="[0, 8, 16]" :look-at="[0, 4, 0]" />
    <OrbitControls />
    <TresDirectionalLight :position="[5, 10, 5]" :intensity="2" />
    <TresAmbientLight :intensity="0.5" />

    <!-- Static ground slab — visual only, physics handled by the fixed body above -->
    <TresMesh :position="[0, -0.1, 0]">
      <TresBoxGeometry :args="[20, 0.2, 20]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <!-- Orbs spawned from the OrbPrefab -->
    <DumasEntity v-for="(orb, index) in orbs" :key="index" :eid="orb.eid">
      <TresMesh>
        <TresSphereGeometry :args="[0.5, 32, 32]" />
        <TresMeshStandardMaterial :color="orb.color" />
      </TresMesh>
    </DumasEntity>
  </Scene>
</template>
