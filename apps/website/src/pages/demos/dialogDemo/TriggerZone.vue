<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider, useCollisionHandler } from "@dumas/core";
import type { Vec3 } from "@dumas/core";

const SENSOR_HALF_SIZE = 1.6;
const PILLAR_HEIGHT = 2.5;

const props = defineProps<{
  position: Vec3;
  playerEid: number;
  color: string;
}>();

const emit = defineEmits<{
  enter: [];
  exit: [];
}>();

const { eid, groupRef } = useGameObject({ position: props.position });
useRigidBody({ eid, type: "fixed" });
useCollider({
  eid,
  shape: "box",
  args: [SENSOR_HALF_SIZE, SENSOR_HALF_SIZE, SENSOR_HALF_SIZE],
  isSensor: true,
});

useCollisionHandler({
  eid,
  handler: ({ eidA, eidB, type }) => {
    const otherEid = eidA === eid ? eidB : eidA;
    if (otherEid !== props.playerEid) return;
    if (type === "started") {
      emit("enter");
    } else {
      emit("exit");
    }
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <!-- Ground ring marking the trigger area -->
    <TresMesh :position="[0, -SENSOR_HALF_SIZE + 0.02, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[SENSOR_HALF_SIZE - 0.12, SENSOR_HALF_SIZE, 48]" />
      <TresMeshStandardMaterial :color="color" :emissive="color" :emissive-intensity="1" />
    </TresMesh>

    <!-- Pillar -->
    <TresMesh :position="[0, PILLAR_HEIGHT / 2 - SENSOR_HALF_SIZE, 0]">
      <TresCylinderGeometry :args="[0.12, 0.12, PILLAR_HEIGHT, 8]" />
      <TresMeshStandardMaterial :color="color" :emissive="color" :emissive-intensity="0.2" />
    </TresMesh>

    <!-- Orb at top -->
    <TresMesh :position="[0, PILLAR_HEIGHT - SENSOR_HALF_SIZE + 0.3, 0]">
      <TresSphereGeometry :args="[0.28, 16, 16]" />
      <TresMeshStandardMaterial :color="color" :emissive="color" :emissive-intensity="1.2" />
    </TresMesh>
  </TresGroup>
</template>
