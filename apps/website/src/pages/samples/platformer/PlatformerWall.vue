<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const props = defineProps<{
  position: [number, number, number];
}>();

const HALF_W = 0.25;
const HALF_H = 1.5;
const HALF_D = 1;

const { groupRef, eid } = useGameObject({ position: props.position });
useRigidBody({ eid, type: "fixed" });
useCollider({ eid, shape: "box", args: [HALF_W, HALF_H, HALF_D], friction: 0, restitution: 0 });
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresBoxGeometry :args="[HALF_W * 2, HALF_H * 2, HALF_D * 2]" />
      <TresMeshStandardMaterial color="#888" />
    </TresMesh>
  </TresGroup>
</template>
