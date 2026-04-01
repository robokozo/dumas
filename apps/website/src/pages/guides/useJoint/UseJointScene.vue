<script setup lang="ts">
import { ref } from "vue";
import {
  Scene,
  DumasEntity,
  useEcsComponent,
  usePhysics,
  useJoint,
  useSystem,
  createPhysics,
  createCuboidCollider,
  createTransform,
} from "@dumas/core";

usePhysics({ gravity: [0, -9.81, 0] });

// ---------------------------------------------------------------------------
// Demo 1 — Revolute (hinge) pendulum on the left side
// ---------------------------------------------------------------------------

// Fixed anchor point — invisible body suspended in the air.
const { eid: anchorEid, transform: anchorTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        point: createCuboidCollider({ halfExtents: [0.15, 0.15, 0.15] }),
      },
    }),
  },
});
anchorTransform.posX.value = -4;
anchorTransform.posY.value = 5;
anchorTransform.posZ.value = 0;

// Dynamic box that will swing as a pendulum.
const { eid: pendulumEid, transform: pendulumTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        box: createCuboidCollider({ halfExtents: [0.4, 0.4, 0.4] }),
      },
    }),
  },
});
// Offset horizontally from the anchor so the pendulum starts swinging.
const PENDULUM_START_OFFSET_X = 2;
pendulumTransform.posX.value = -4 + PENDULUM_START_OFFSET_X;
pendulumTransform.posY.value = 3;
pendulumTransform.posZ.value = 0;

// Hinge joint — the box swings around the Z axis beneath the anchor.
useJoint({
  type: "revolute",
  bodyA: anchorEid,
  bodyB: pendulumEid,
  axis: { x: 0, y: 0, z: 1 },
  anchorA: { x: 0, y: 0, z: 0 },
  anchorB: { x: 0, y: 2, z: 0 },
});

// ---------------------------------------------------------------------------
// Pendulum rope — thin cylinder updated each frame to connect anchor → bob
// ---------------------------------------------------------------------------

const ROPE_RADIUS = 0.03;

const ropePosition = ref<[number, number, number]>([-4, 4, 0]);
const ropeScale = ref<[number, number, number]>([1, 2, 1]);
const ropeRotation = ref<[number, number, number]>([0, 0, 0]);

useSystem({
  components: [createTransform],
  fn: () => {
    const ax = anchorTransform.posX.value;
    const ay = anchorTransform.posY.value;
    const az = anchorTransform.posZ.value;

    const bx = pendulumTransform.posX.value;
    const by = pendulumTransform.posY.value;
    const bz = pendulumTransform.posZ.value;

    // Midpoint between anchor and pendulum bob
    const midX = (ax + bx) / 2;
    const midY = (ay + by) / 2;
    const midZ = (az + bz) / 2;

    // Distance between anchor and bob
    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Angle in the XY plane from vertical (the cylinder's default orientation)
    const angle = Math.atan2(dx, dy);

    ropePosition.value = [midX, midY, midZ];
    // CylinderGeometry height is 1 by default; scale Y to match distance
    ropeScale.value = [1, distance, 1];
    ropeRotation.value = [0, 0, -angle];
  },
});

// ---------------------------------------------------------------------------
// Demo 2 — Spring joint between two falling boxes on the right side
// ---------------------------------------------------------------------------

const { eid: springBoxAEid, transform: springBoxATransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        box: createCuboidCollider({ halfExtents: [0.35, 0.35, 0.35], restitution: 0.6 }),
      },
    }),
  },
});
springBoxATransform.posX.value = 4;
springBoxATransform.posY.value = 8;
springBoxATransform.posZ.value = 0;

const { eid: springBoxBEid, transform: springBoxBTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        box: createCuboidCollider({ halfExtents: [0.35, 0.35, 0.35], restitution: 0.6 }),
      },
    }),
  },
});
springBoxBTransform.posX.value = 4;
springBoxBTransform.posY.value = 5;
springBoxBTransform.posZ.value = 0;

// Spring joint — the two boxes bounce relative to each other as they fall.
useJoint({
  type: "spring",
  bodyA: springBoxAEid,
  bodyB: springBoxBEid,
  anchorA: { x: 0, y: -0.35, z: 0 },
  anchorB: { x: 0, y: 0.35, z: 0 },
  restLength: 1.5,
  stiffness: 40,
  damping: 1,
});

// Ground — wide fixed slab so the spring boxes have something to land on.
const { transform: groundTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        ground: createCuboidCollider({ halfExtents: [10, 0.1, 10], restitution: 0.3 }),
      },
    }),
  },
});
groundTransform.posY.value = 0;
</script>

<template>
  <Scene name="joints-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 5, 16]" :look-at="[0, 4, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 10, 5]" :intensity="2" />

    <!-- Anchor point visual (small dark cube) -->
    <DumasEntity :eid="anchorEid">
      <TresMesh>
        <TresBoxGeometry :args="[0.3, 0.3, 0.3]" />
        <TresMeshStandardMaterial color="#555555" />
      </TresMesh>
    </DumasEntity>

    <!-- Pendulum box -->
    <DumasEntity :eid="pendulumEid">
      <TresMesh>
        <TresBoxGeometry :args="[0.8, 0.8, 0.8]" />
        <TresMeshStandardMaterial color="#ff6b6b" />
      </TresMesh>
    </DumasEntity>

    <!-- Pendulum rope (thin cylinder connecting anchor to bob) -->
    <TresMesh :position="ropePosition" :scale="ropeScale" :rotation="ropeRotation">
      <TresCylinderGeometry :args="[ROPE_RADIUS, ROPE_RADIUS, 1, 8]" />
      <TresMeshStandardMaterial color="#cccccc" />
    </TresMesh>

    <!-- Spring box A -->
    <DumasEntity :eid="springBoxAEid">
      <TresMesh>
        <TresBoxGeometry :args="[0.7, 0.7, 0.7]" />
        <TresMeshStandardMaterial color="#4ecdc4" />
      </TresMesh>
    </DumasEntity>

    <!-- Spring box B -->
    <DumasEntity :eid="springBoxBEid">
      <TresMesh>
        <TresBoxGeometry :args="[0.7, 0.7, 0.7]" />
        <TresMeshStandardMaterial color="#ffe66d" />
      </TresMesh>
    </DumasEntity>

    <!-- Ground slab -->
    <TresMesh :position="[0, -0.1, 0]">
      <TresBoxGeometry :args="[20, 0.2, 20]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>
  </Scene>
</template>
