<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";

const { groupRef, eid } = useGameObject({ position: [-3, 2, 0] });
const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });
useCollider({ eid, shape: "sphere", radius: 0.5 });

useSystem({
  fn: ({ elapsed }) => {
    const rb = rigidBody.value;
    if (rb === null) {
      return;
    }
    const x = Math.sin(elapsed) * 3;
    rb.setNextKinematicTranslation({ x, y: 2, z: 0 });
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresSphereGeometry :args="[0.5, 32, 32]" />
      <TresMeshStandardMaterial color="#fa4" />
    </TresMesh>
  </TresGroup>
</template>
