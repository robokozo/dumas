<script setup lang="ts">
import { GameObject, RigidBody, Collider } from "@dumas/core";

const BALL_START_HEIGHT = 12;
const BALL_RADIUS = 0.5;
const BALL_BOUNCINESS = 0.8;
</script>

<template>
  <GameObject :position="[4, BALL_START_HEIGHT, 0]">
    <RigidBody type="dynamic" />
    <Collider shape="sphere" :radius="BALL_RADIUS" :restitution="BALL_BOUNCINESS" />
    <TresMesh>
      <TresSphereGeometry :args="[BALL_RADIUS, 32, 32]" />
      <TresMeshStandardMaterial color="#00cc66" />
    </TresMesh>
  </GameObject>
</template>
