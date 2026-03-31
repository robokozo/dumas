<script setup lang="ts">
import { DumasEntity, useEcsComponent, useInput } from "@dumas/core";
import { DUNGEON_INPUT } from "./inputMap";

const MOVE_SPEED = 5;

const props = defineProps<{
  startX: number;
  startZ: number;
}>();

const emit = defineEmits<{
  moved: [pos: { x: number; z: number }];
}>();

const { eid, transform } = useEcsComponent({ components: {} });

transform.posX.value = props.startX;
transform.posZ.value = props.startZ;

useInput({
  map: DUNGEON_INPUT,
  fn: ({ delta, held }) => {
    let dx = 0;
    let dz = 0;
    if (held.moveUp.value === true) dz -= 1;
    if (held.moveDown.value === true) dz += 1;
    if (held.moveLeft.value === true) dx -= 1;
    if (held.moveRight.value === true) dx += 1;

    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 0) {
      dx /= len;
      dz /= len;
      transform.posX.value += dx * MOVE_SPEED * delta;
      transform.posZ.value += dz * MOVE_SPEED * delta;

      const halfAngle = Math.atan2(dx, dz) / 2;
      transform.rotY.value = Math.sin(halfAngle);
      transform.rotW.value = Math.cos(halfAngle);
    }

    emit("moved", { x: transform.posX.value, z: transform.posZ.value });
  },
});
</script>

<template>
  <DumasEntity :eid="eid">
    <!-- Body -->
    <TresMesh :position="[0, 0.38, 0]">
      <TresCylinderGeometry :args="[0.18, 0.22, 0.7, 8]" />
      <TresMeshStandardMaterial color="#4a9f5a" />
    </TresMesh>
    <!-- Head -->
    <TresMesh :position="[0, 0.96, 0]">
      <TresSphereGeometry :args="[0.19, 8, 6]" />
      <TresMeshStandardMaterial color="#f4c2a1" />
    </TresMesh>
    <!-- Direction dot -->
    <TresMesh :position="[0, 0.96, 0.18]">
      <TresSphereGeometry :args="[0.05, 4, 4]" />
      <TresMeshStandardMaterial color="#3a6a3a" />
    </TresMesh>
  </DumasEntity>
</template>
