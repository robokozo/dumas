<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const BALL_START_HEIGHT = 8;
const BALL_RADIUS = 0.5;
const BALL_BOUNCINESS = 0.8;
const SPHERE_SEGMENTS = 32;

const { groupRef, eid } = useGameObject({ position: [0, BALL_START_HEIGHT, 0] });
useRigidBody({ eid, type: "dynamic" });
useCollider({ eid, shape: "sphere", radius: BALL_RADIUS, restitution: BALL_BOUNCINESS });
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresSphereGeometry :args="[BALL_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]" />
      <TresMeshStandardMaterial color="#ff6600" />
    </TresMesh>
  </TresGroup>
</template>
