<script setup lang="ts">
import { shallowRef, watch } from "vue";
import type { Object3D } from "three";
import { useSystem, useWorld } from "@dumas/core";
import type { PoolHandle } from "@dumas/core";

const { handle } = defineProps<{ handle: PoolHandle }>();

const RADIUS = 0.4;
const ctx = useWorld();

const meshRef = shallowRef<Object3D | null>(null);

// Register mesh in entityMeshMap so renderSyncSystem handles transform sync
watch(meshRef, (mesh, oldMesh) => {
  if (oldMesh !== null) {
    ctx.entityMeshMap.delete(handle.eid);
  }
  if (mesh !== null) {
    ctx.entityMeshMap.set(handle.eid, mesh);
  }
});

// Only toggle visibility — transform sync is handled by renderSyncSystem
useSystem({
  fn: () => {
    const mesh = meshRef.value;
    if (mesh === null) return;
    mesh.visible = handle.isActive === true;
  },
});
</script>

<template>
  <TresMesh ref="meshRef" :visible="false">
    <TresSphereGeometry :args="[RADIUS, 16, 16]" />
    <TresMeshStandardMaterial color="#1a1a1a" :metalness="0.9" :roughness="0.1" />
  </TresMesh>
</template>
