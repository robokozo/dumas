<script setup lang="ts">
import { GameObject, RigidBody, Collider } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
import KinematicSphere from "./KinematicSphere.vue";
</script>

<template>
  <TresPerspectiveCamera :position="[0, 5, 16]" :look-at="[0, 2, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight :position="[5, 8, 5]" :intensity="1" />

  <!-- Dynamic ball -->
  <GameObject :position="[0, 5, 0]">
    <RigidBody type="dynamic">
      <Collider shape="sphere" :radius="0.5" :restitution="0.7" />
    </RigidBody>
    <TresMesh>
      <TresSphereGeometry :args="[0.5, 32, 32]" />
      <TresMeshStandardMaterial color="#4af" />
    </TresMesh>
  </GameObject>

  <!-- Fixed ground -->
  <GameObject :position="[0, -0.5, 0]">
    <RigidBody type="fixed">
      <Collider shape="box" :args="[5, 0.5, 5]" />
    </RigidBody>
    <TresMesh>
      <TresBoxGeometry :args="[10, 1, 10]" />
      <TresMeshStandardMaterial color="#555" />
    </TresMesh>
  </GameObject>

  <!-- Kinematic sphere (moves side-to-side via useSystem) -->
  <KinematicSphere />

  <!-- Second dynamic ball to show kinematic interaction -->
  <GameObject :position="[-3, 5, 0]">
    <RigidBody type="dynamic">
      <Collider shape="sphere" :radius="0.4" :restitution="0.5" />
    </RigidBody>
    <TresMesh>
      <TresSphereGeometry :args="[0.4, 32, 32]" />
      <TresMeshStandardMaterial color="#a4f" />
    </TresMesh>
  </GameObject>
</template>
