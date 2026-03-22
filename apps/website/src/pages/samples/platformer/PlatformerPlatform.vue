<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const props = defineProps<{
  position: [number, number, number];
  width: number;
}>();

const HALF_HEIGHT = 0.25;
const HALF_DEPTH = 1;

const { groupRef, eid } = useGameObject({ position: props.position });
useRigidBody({ eid, type: "fixed" });
useCollider({
  eid,
  shape: "box",
  args: [props.width / 2, HALF_HEIGHT, HALF_DEPTH],
  friction: 0.8,
  restitution: 0,
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresBoxGeometry :args="[props.width, HALF_HEIGHT * 2, HALF_DEPTH * 2]" />
      <TresMeshStandardMaterial color="#5a8a5a" />
    </TresMesh>
  </TresGroup>
</template>
