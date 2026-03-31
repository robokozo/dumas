<script setup lang="ts">
import {
  DumasEntity,
  useEcsComponent,
  useJoint,
  createPhysics,
  createCuboidCollider,
} from "@dumas/core";
import {
  BUMPER_X,
  BUMPER_Y,
  BUMPER_Z,
  BUMPER_REST_LENGTH,
  BUMPER_STIFFNESS,
  BUMPER_DAMPING,
  BUMPER_COLOR,
  WALL_COLOR,
} from "./constants";

const BUMPER_HALF = 0.35;
const WALL_ANCHOR_X = BUMPER_X - 1.2;

// Fixed wall anchor — the spring attaches to this.
const { eid: wallEid, transform: wallTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [0.15, 0.5, 1.0] }),
      },
    }),
  },
});
wallTransform.posX.value = WALL_ANCHOR_X;
wallTransform.posY.value = BUMPER_Y;
wallTransform.posZ.value = BUMPER_Z;

// Dynamic bumper pad — bounces the marble sideways.
const { eid: bumperEid, transform: bumperTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        pad: createCuboidCollider({
          halfExtents: [BUMPER_HALF, BUMPER_HALF, 0.8],
          restitution: 0.9,
          friction: 0.2,
        }),
      },
    }),
  },
});
bumperTransform.posX.value = BUMPER_X;
bumperTransform.posY.value = BUMPER_Y;
bumperTransform.posZ.value = BUMPER_Z;

// Spring joint — connects bumper pad to wall anchor.
useJoint({
  type: "spring",
  bodyA: wallEid,
  bodyB: bumperEid,
  anchorA: { x: 0.15, y: 0, z: 0 },
  anchorB: { x: -BUMPER_HALF, y: 0, z: 0 },
  restLength: BUMPER_REST_LENGTH,
  stiffness: BUMPER_STIFFNESS,
  damping: BUMPER_DAMPING,
});
</script>

<template>
  <!-- Wall anchor visual -->
  <DumasEntity :eid="wallEid">
    <TresMesh>
      <TresBoxGeometry :args="[0.3, 1.0, 2.0]" />
      <TresMeshStandardMaterial :color="WALL_COLOR" />
    </TresMesh>
  </DumasEntity>

  <!-- Bumper pad visual -->
  <DumasEntity :eid="bumperEid">
    <TresMesh>
      <TresBoxGeometry :args="[BUMPER_HALF * 2, BUMPER_HALF * 2, 1.6]" />
      <TresMeshStandardMaterial
        :color="BUMPER_COLOR"
        :emissive="BUMPER_COLOR"
        :emissive-intensity="0.4"
      />
    </TresMesh>
  </DumasEntity>
</template>
