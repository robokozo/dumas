<script setup lang="ts">
import { onMounted } from "vue";
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const props = defineProps<{
  position: [number, number, number];
}>();

const emit = defineEmits<{
  ready: [eid: number];
}>();

const { eid, groupRef } = useGameObject({ position: props.position });
useRigidBody({ eid, type: "fixed" });
useCollider({ eid, shape: "sphere", radius: 0.3, isSensor: true });

onMounted(() => {
  emit("ready", eid);
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresSphereGeometry :args="[0.3, 16, 16]" />
      <TresMeshStandardMaterial color="#fa4" emissive="#fa4" :emissive-intensity="0.4" />
    </TresMesh>
  </TresGroup>
</template>
