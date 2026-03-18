<script setup lang="ts">
import { GameObject, RigidBody, Collider } from "@dumas/core";

const BALL_START_HEIGHT = 10;
const BALL_RADIUS = 0.5;
const BALL_BOUNCINESS = 0.8;
</script>

<template>
  <GameObject :position="[2, BALL_START_HEIGHT, 0]" v-slot="{ eid }">
    <RigidBody :eid="eid" type="dynamic" />
    <Collider :eid="eid" shape="sphere" :radius="BALL_RADIUS" :restitution="BALL_BOUNCINESS" />
    <TresMesh>
      <TresSphereGeometry :args="[BALL_RADIUS, 32, 32]" />
      <TresMeshStandardMaterial color="#0066ff" />
    </TresMesh>
  </GameObject>
</template>
