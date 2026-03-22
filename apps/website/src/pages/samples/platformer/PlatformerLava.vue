<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const props = defineProps<{
  playerEid: number;
}>();

const emit = defineEmits<{
  die: [];
}>();

const HALF_WIDTH = 20;
const HALF_HEIGHT = 0.5;
const HALF_DEPTH = 2;
const LAVA_Y = -3;

const { groupRef, eid } = useGameObject({ position: [0, LAVA_Y, 0] });
useRigidBody({ eid, type: "fixed" });
useCollider({
  eid,
  shape: "box",
  args: [HALF_WIDTH, HALF_HEIGHT, HALF_DEPTH],
  isSensor: true,
  onCollision: ({ eidA, eidB, type }) => {
    if (type !== "started") return;
    const hitEid = eidA === eid ? eidB : eidA;
    if (hitEid === props.playerEid) {
      emit("die");
    }
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresBoxGeometry :args="[HALF_WIDTH * 2, HALF_HEIGHT * 2, HALF_DEPTH * 2]" />
      <TresMeshStandardMaterial color="#ff3300" emissive="#ff2200" :emissive-intensity="0.8" />
    </TresMesh>
  </TresGroup>
</template>
