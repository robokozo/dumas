<script setup lang="ts">
import { GameObject, RigidBody, Collider } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 5, 16]" :look-at="[0, 2, 0]" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1" />

    <!-- Box collider, low bounce -->
    <GameObject :position="[-3, 4, 0]">
      <RigidBody type="dynamic">
        <Collider shape="box" :args="[0.5, 0.5, 0.5]" :restitution="0.3" />
      </RigidBody>
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#4af" />
      </TresMesh>
    </GameObject>

    <!-- Sphere collider, high bounce -->
    <GameObject :position="[0, 6, 0]">
      <RigidBody type="dynamic">
        <Collider shape="sphere" :radius="0.5" :restitution="0.9" />
      </RigidBody>
      <TresMesh>
        <TresSphereGeometry :args="[0.5, 32, 32]" />
        <TresMeshStandardMaterial color="#f4a" />
      </TresMesh>
    </GameObject>

    <!-- Capsule collider, medium bounce -->
    <GameObject :position="[3, 5, 0]">
      <RigidBody type="dynamic">
        <Collider shape="capsule" :radius="0.3" :half-height="0.5" :restitution="0.5" />
      </RigidBody>
      <TresMesh>
        <TresCapsuleGeometry :args="[0.3, 1, 16, 32]" />
        <TresMeshStandardMaterial color="#4fa" />
      </TresMesh>
    </GameObject>

    <!-- Ground -->
    <GameObject :position="[0, -0.5, 0]">
      <RigidBody type="fixed">
        <Collider shape="box" :args="[6, 0.5, 3]" :friction="0.8" />
      </RigidBody>
      <TresMesh>
        <TresBoxGeometry :args="[12, 1, 6]" />
        <TresMeshStandardMaterial color="#555" />
      </TresMesh>
    </GameObject>
  </GameObject>
</template>
