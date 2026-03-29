<script setup lang="ts">
import { Physics, RigidBody, Scene } from "@dumas/core";
import BouncingBall from "./BouncingBall.vue";
</script>

<template>
  <Scene name="demo" :default="true">
    <TresPerspectiveCamera :position="[0, 1, 20]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[0, 5, 5]" :intensity="1.5" />

    <Suspense>
      <Physics :gravity="[0, 0, 0]">
        <!-- Red wall — left -->
        <RigidBody type="fixed" collider="cuboid" :restitution="1" :friction="0">
          <TresMesh :position="[-4, 0, 0]">
            <TresBoxGeometry :args="[0.4, 4, 1]" />
            <TresMeshStandardMaterial
              color="#ff4444"
              emissive="#ff2222"
              :emissive-intensity="0.35"
            />
          </TresMesh>
        </RigidBody>

        <!-- Blue wall — right -->
        <RigidBody type="fixed" collider="cuboid" :restitution="1" :friction="0">
          <TresMesh :position="[4, 0, 0]">
            <TresBoxGeometry :args="[0.4, 4, 1]" />
            <TresMeshStandardMaterial
              color="#4488ff"
              emissive="#2255ff"
              :emissive-intensity="0.35"
            />
          </TresMesh>
        </RigidBody>

        <BouncingBall />
      </Physics>
    </Suspense>
  </Scene>
</template>
