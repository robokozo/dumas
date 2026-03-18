<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const GROUND_Y = -0.5;
const GROUND_HALF_EXTENTS: [number, number, number] = [10, 0.5, 10];
const GROUND_SIZE: [number, number, number] = [20, 1, 20];
const GROUND_BOUNCINESS = 0.5;

const { groupRef, eid } = useGameObject({ position: [0, GROUND_Y, 0] });
useRigidBody({ eid, type: "fixed" });
useCollider({ eid, shape: "box", args: GROUND_HALF_EXTENTS, restitution: GROUND_BOUNCINESS });
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresBoxGeometry :args="GROUND_SIZE" />
      <TresMeshStandardMaterial color="#444444" />
    </TresMesh>
  </TresGroup>
</template>
