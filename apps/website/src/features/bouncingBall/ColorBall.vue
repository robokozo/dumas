<script setup lang="ts">
import { shallowRef } from "vue";
import type { Mesh, MeshStandardMaterial } from "three";
import { Color } from "three";
import { useGameObject, useRigidBody, useCollider, useCollisionHandler } from "@dumas/core";

const { position } = defineProps<{ position: [number, number, number] }>();

const RADIUS = 0.35;
const SPHERE_SEGMENTS = 24;
const COLORS = [
  "#ff6b35",
  "#0582ca",
  "#06d6a0",
  "#e63946",
  "#f4a261",
  "#8338ec",
  "#3a86ff",
  "#ff006e",
];

const { groupRef, eid } = useGameObject({ position });
useRigidBody({ eid, type: "dynamic" });
useCollider({ eid, shape: "sphere", radius: RADIUS, restitution: 0.7 });

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const initialColor = randomColor();
const meshRef = shallowRef<Mesh | null>(null);

useCollisionHandler({
  eid,
  handler: (event) => {
    if (event.type === "started" && meshRef.value !== null) {
      const material = meshRef.value.material as MeshStandardMaterial;
      material.color.set(new Color(randomColor()));
    }
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh ref="meshRef">
      <TresSphereGeometry :args="[RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]" />
      <TresMeshStandardMaterial :color="initialColor" :metalness="0.4" :roughness="0.3" />
    </TresMesh>
  </TresGroup>
</template>
