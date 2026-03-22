<script setup lang="ts">
import { ref } from "vue";
import { useGameObject, useRigidBody, useCollider, useCollisionHandler } from "@dumas/core";

const color = ref<string>("#4af");

const { groupRef, eid } = useGameObject({
  position: [0, 5, 0],
});

useRigidBody({ eid, type: "dynamic" });
useCollider({ eid, shape: "sphere", radius: 0.5, restitution: 0.6 });

useCollisionHandler({
  eid,
  handler: (event) => {
    if (event.type === "started") {
      color.value = "#4fa";
    }
    if (event.type === "stopped") {
      color.value = "#4af";
    }
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresSphereGeometry :args="[0.5, 32, 32]" />
      <TresMeshStandardMaterial :color="color" />
    </TresMesh>
  </TresGroup>
</template>
