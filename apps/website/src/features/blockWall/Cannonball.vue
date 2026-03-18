<script setup lang="ts">
import { shallowRef } from "vue";
import type { Object3D } from "three";
import { useSystem } from "@dumas/core";
import type { PoolHandle } from "@dumas/core";

const { handle } = defineProps<{ handle: PoolHandle }>();

const RADIUS = 0.4;

const meshRef = shallowRef<Object3D | null>(null);

useSystem({
  fn: () => {
    const mesh = meshRef.value;
    if (mesh === null) return;

    if (handle.isActive === true) {
      const pos = handle.rigidBody.translation();
      const rot = handle.rigidBody.rotation();
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
      mesh.visible = true;
    } else {
      mesh.visible = false;
    }
  },
});
</script>

<template>
  <TresMesh ref="meshRef" :visible="false">
    <TresSphereGeometry :args="[RADIUS, 16, 16]" />
    <TresMeshStandardMaterial color="#1a1a1a" :metalness="0.9" :roughness="0.1" />
  </TresMesh>
</template>
