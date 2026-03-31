<script setup lang="ts">
import { DumasEntity, useEcsComponent, useSystem } from "@dumas/core";

const MOVE_SPEED = 4;
const ARRIVAL_DIST = 0.12;

const props = defineProps<{
  targetX: number;
  targetZ: number;
  isMoving: boolean;
}>();

const emit = defineEmits<{
  ready: [eid: number];
  arrived: [];
}>();

const { eid, transform } = useEcsComponent({ components: {} });

// Emit eid synchronously so the scene has it before the first frame runs.
emit("ready", eid);

let isArrivedEmitted = false;

useSystem({
  fn: ({ delta }) => {
    if (props.isMoving === false) {
      // Reset guard each time movement stops so the next trip fires correctly.
      isArrivedEmitted = false;
      return;
    }

    const dx = props.targetX - transform.posX.value;
    const dz = props.targetZ - transform.posZ.value;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < ARRIVAL_DIST) {
      if (isArrivedEmitted === false) {
        isArrivedEmitted = true;
        emit("arrived");
      }
      return;
    }

    const nx = dx / dist;
    const nz = dz / dist;
    transform.posX.value += nx * MOVE_SPEED * delta;
    transform.posZ.value += nz * MOVE_SPEED * delta;

    transform.setRotationY({ angle: Math.atan2(nx, nz) });
  },
});
</script>

<template>
  <DumasEntity :eid="eid">
    <!-- Body -->
    <TresMesh :position="[0, 0.38, 0]">
      <TresCylinderGeometry :args="[0.18, 0.22, 0.7, 8]" />
      <TresMeshStandardMaterial color="#4a7fa5" />
    </TresMesh>
    <!-- Head -->
    <TresMesh :position="[0, 0.96, 0]">
      <TresSphereGeometry :args="[0.19, 8, 6]" />
      <TresMeshStandardMaterial color="#f4c2a1" />
    </TresMesh>
    <!-- Direction dot — makes rotation visible -->
    <TresMesh :position="[0, 0.96, 0.18]">
      <TresSphereGeometry :args="[0.05, 4, 4]" />
      <TresMeshStandardMaterial color="#c06030" />
    </TresMesh>
  </DumasEntity>
</template>
