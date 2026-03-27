<script setup lang="ts">
import { ref } from "vue";
import { useEntity, useEcsComponent, useSystem, Transform } from "@dumas/core";
import type { Mesh } from "three";

const ROTATION_SPEED_Y = 0.8;
const ROTATION_SPEED_X = 0.3;

const meshRef = ref<Mesh | null>(null);

const { eid } = useEntity();
useEcsComponent({ eid, components: [Transform] });

useSystem({
  fn: ({ delta }) => {
    if (meshRef.value !== null) {
      meshRef.value.rotation.y += delta * ROTATION_SPEED_Y;
      meshRef.value.rotation.x += delta * ROTATION_SPEED_X;

      meshRef.value.position.x = Transform.posX[eid];
      meshRef.value.position.y = Transform.posY[eid];
      meshRef.value.position.z = Transform.posZ[eid];
    }
  },
});
</script>

<template>
  <TresMesh ref="meshRef">
    <TresBoxGeometry :args="[1.5, 1.5, 1.5]" />
    <TresMeshStandardMaterial color="#44aaff" />
  </TresMesh>
</template>
