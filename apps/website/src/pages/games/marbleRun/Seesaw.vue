<script setup lang="ts">
import {
  DumasEntity,
  useEcsComponent,
  useJoint,
  createPhysics,
  createCuboidCollider,
} from "@dumas/core";
import {
  SEESAW_X,
  SEESAW_Y,
  SEESAW_Z,
  SEESAW_HALF_WIDTH,
  SEESAW_HALF_HEIGHT,
  SEESAW_HALF_DEPTH,
  SEESAW_ANGLE_LIMIT,
  SEESAW_COLOR,
} from "./constants";

// Fixed anchor point in the air — the pivot.
const { eid: anchorEid, transform: anchorTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        point: createCuboidCollider({ halfExtents: [0.1, 0.1, 0.1] }),
      },
    }),
  },
});
anchorTransform.posX.value = SEESAW_X;
anchorTransform.posY.value = SEESAW_Y;
anchorTransform.posZ.value = SEESAW_Z;

// Dynamic plank that tips when the marble rolls onto it.
const { eid: plankEid, transform: plankTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        plank: createCuboidCollider({
          halfExtents: [SEESAW_HALF_WIDTH, SEESAW_HALF_HEIGHT, SEESAW_HALF_DEPTH],
          friction: 0.6,
        }),
      },
    }),
  },
});
plankTransform.posX.value = SEESAW_X;
plankTransform.posY.value = SEESAW_Y;
plankTransform.posZ.value = SEESAW_Z;

// Revolute joint — hinge around the Z axis so the plank tips left/right.
useJoint({
  type: "revolute",
  bodyA: anchorEid,
  bodyB: plankEid,
  axis: { x: 0, y: 0, z: 1 },
  anchorA: { x: 0, y: 0, z: 0 },
  anchorB: { x: 0, y: 0, z: 0 },
  limits: { min: -SEESAW_ANGLE_LIMIT, max: SEESAW_ANGLE_LIMIT },
});
</script>

<template>
  <!-- Anchor pivot visual (small cylinder) -->
  <DumasEntity :eid="anchorEid">
    <TresMesh>
      <TresCylinderGeometry :args="[0.12, 0.12, 0.3, 8]" />
      <TresMeshStandardMaterial color="#888888" />
    </TresMesh>
  </DumasEntity>

  <!-- Plank visual -->
  <DumasEntity :eid="plankEid">
    <TresMesh>
      <TresBoxGeometry
        :args="[SEESAW_HALF_WIDTH * 2, SEESAW_HALF_HEIGHT * 2, SEESAW_HALF_DEPTH * 2]"
      />
      <TresMeshStandardMaterial
        :color="SEESAW_COLOR"
        :emissive="SEESAW_COLOR"
        :emissive-intensity="0.15"
      />
    </TresMesh>
  </DumasEntity>
</template>
