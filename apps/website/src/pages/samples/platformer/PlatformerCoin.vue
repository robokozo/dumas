<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const props = defineProps<{
  position: [number, number, number];
  playerEid: number;
}>();

const emit = defineEmits<{
  collect: [];
}>();

const RADIUS = 0.3;

const { groupRef, eid } = useGameObject({ position: props.position });
useRigidBody({ eid, type: "fixed" });
useCollider({
  eid,
  shape: "sphere",
  radius: RADIUS,
  isSensor: true,
  onCollision: ({ eidA, eidB, type }) => {
    if (type !== "started") return;
    const hitEid = eidA === eid ? eidB : eidA;
    if (hitEid === props.playerEid) {
      emit("collect");
    }
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresSphereGeometry :args="[RADIUS, 16, 16]" />
      <TresMeshStandardMaterial color="#ffd700" :metalness="0.6" :roughness="0.2" />
    </TresMesh>
  </TresGroup>
</template>
