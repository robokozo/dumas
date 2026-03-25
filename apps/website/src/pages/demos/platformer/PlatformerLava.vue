<script setup lang="ts">
import { onMounted } from "vue";
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const emit = defineEmits<{
  ready: [eid: number];
}>();

const HALF_WIDTH = 20;
const HALF_HEIGHT = 0.5;
const HALF_DEPTH = 2;
const LAVA_Y = -3;

const { groupRef, eid } = useGameObject({ position: { x: 0, y: LAVA_Y, z: 0 } });
useRigidBody({ eid, type: "fixed" });
useCollider({ eid, shape: "box", args: [HALF_WIDTH, HALF_HEIGHT, HALF_DEPTH], isSensor: true });

onMounted(() => {
  emit("ready", eid);
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
