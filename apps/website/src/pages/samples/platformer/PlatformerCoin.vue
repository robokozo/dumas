<script setup lang="ts">
import { onMounted } from "vue";
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";
import type { Vec3 } from "@dumas/core";

const props = defineProps<{
  position: Vec3;
}>();

const emit = defineEmits<{
  ready: [eid: number];
}>();

const RADIUS = 0.3;

const { groupRef, eid } = useGameObject({ position: props.position });
useRigidBody({ eid, type: "fixed" });
useCollider({ eid, shape: "sphere", radius: RADIUS, isSensor: true });

onMounted(() => {
  emit("ready", eid);
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
