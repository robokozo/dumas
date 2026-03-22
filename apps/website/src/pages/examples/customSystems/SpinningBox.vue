<script setup lang="ts">
import { useGameObject, useSystem } from "@dumas/core";

const { groupRef } = useGameObject({
  position: [0, 2, 0],
});

useSystem({
  fn: ({ delta, elapsed }) => {
    const mesh = groupRef.value;
    if (mesh === null) {
      return;
    }
    mesh.rotation.y += delta * 1.0;
    mesh.position.y = 2 + Math.sin(elapsed * 2) * 0.5;
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial color="#f4a" />
    </TresMesh>
  </TresGroup>
</template>
