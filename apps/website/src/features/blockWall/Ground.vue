<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const GROUND_HALF: [number, number, number] = [15, 0.25, 15];
const GROUND_SIZE: [number, number, number] = [30, 0.5, 30];

const { groupRef, eid } = useGameObject({ position: [0, -0.25, 0] });
useRigidBody({ eid, type: "fixed" });
useCollider({ eid, shape: "box", args: GROUND_HALF, restitution: 0.3, friction: 0.8 });
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresBoxGeometry :args="GROUND_SIZE" />
      <TresMeshStandardMaterial color="#333333" />
    </TresMesh>
  </TresGroup>
</template>
