<script setup lang="ts">
import { GameObject, RigidBody, Collider } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
import CollisionBall from "./CollisionBall.vue";
</script>

<template>
  <TresPerspectiveCamera :position="[0, 5, 12]" :look-at="[0, 2, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight :position="[5, 8, 5]" :intensity="1" />

  <CollisionBall />

  <!-- Platform -->
  <GameObject :position="[0, -0.5, 0]">
    <RigidBody type="fixed">
      <Collider shape="box" :args="[3, 0.5, 3]" :restitution="0.6" />
    </RigidBody>
    <TresMesh>
      <TresBoxGeometry :args="[6, 1, 6]" />
      <TresMeshStandardMaterial color="#555" />
    </TresMesh>
  </GameObject>
</template>
