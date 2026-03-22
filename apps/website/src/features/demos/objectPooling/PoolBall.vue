<script setup lang="ts">
import { shallowRef, watch } from "vue";
import type { Object3D } from "three";
import { useSystem, useDumasContext } from "@dumas/core";
import type { PoolHandle } from "@dumas/core";

const { handle } = defineProps<{ handle: PoolHandle }>();

const RADIUS = 0.4;

const ctx = useDumasContext();
const meshRef = shallowRef<Object3D | null>(null);

watch(meshRef, (mesh, oldMesh) => {
  if (oldMesh !== null) {
    ctx.entityMeshMap.delete(handle.eid);
  }
  if (mesh !== null) {
    ctx.entityMeshMap.set(handle.eid, mesh);
  }
});

useSystem({
  fn: () => {
    const mesh = meshRef.value;
    if (mesh === null) {
      return;
    }
    mesh.visible = handle.isActive === true;
  },
});
</script>

<template>
  <TresMesh ref="meshRef" :visible="false">
    <TresSphereGeometry :args="[RADIUS, 16, 16]" />
    <TresMeshStandardMaterial color="#4af" :metalness="0.3" :roughness="0.4" />
  </TresMesh>
</template>
