<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const props = defineProps<{
  position: [number, number, number];
  color: string;
}>();

const BLOCK_HALF: [number, number, number] = [0.5, 0.25, 0.25];
const BLOCK_SIZE: [number, number, number] = [1, 0.5, 0.5];

const { groupRef, eid } = useGameObject({ position: props.position });
useRigidBody({ eid, type: "dynamic" });
useCollider({ eid, shape: "box", args: BLOCK_HALF, restitution: 0.1, friction: 0.8 });
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresBoxGeometry :args="BLOCK_SIZE" />
      <TresMeshStandardMaterial :color="props.color" />
    </TresMesh>
  </TresGroup>
</template>
