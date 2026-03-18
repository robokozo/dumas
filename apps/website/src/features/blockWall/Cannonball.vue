<script setup lang="ts">
import { watch } from "vue";
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";

const props = defineProps<{
  position: [number, number, number];
  velocity: { x: number; y: number; z: number };
}>();

const RADIUS = 0.4;

const { groupRef, eid } = useGameObject({ position: props.position });
const { rigidBody, setLinvel } = useRigidBody({ eid, type: "dynamic" });
useCollider({ eid, shape: "sphere", radius: RADIUS, restitution: 0.3, friction: 0.5 });

function initBall(body: NonNullable<typeof rigidBody.value>) {
  body.enableCcd(true);
  setLinvel(props.velocity);
}

if (rigidBody.value !== null) {
  initBall(rigidBody.value);
} else {
  watch(
    rigidBody,
    (body) => {
      if (body !== null) initBall(body);
    },
    { once: true },
  );
}
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresSphereGeometry :args="[RADIUS, 16, 16]" />
      <TresMeshStandardMaterial color="#1a1a1a" :metalness="0.9" :roughness="0.1" />
    </TresMesh>
  </TresGroup>
</template>
