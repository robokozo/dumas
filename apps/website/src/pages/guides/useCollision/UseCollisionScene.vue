<script setup lang="ts">
import { Physics, RigidBody, Scene } from "@dumas/core";
import BouncingBall from "./BouncingBall.vue";

const LEFT_COLOR = "#ff4444";
const RIGHT_COLOR = "#4488ff";
</script>

<template>
  <Scene name="demo" :default="true">
    <TresPerspectiveCamera :position="[0, 1, 20]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[0, 5, 5]" :intensity="1.5" />

    <Suspense>
      <Physics :gravity="[0, 0, 0]">
        <!-- Left wall -->
        <RigidBody type="fixed" collider="cuboid" :restitution="1" :friction="0">
          <TresMesh :position="[-4, 0, 0]">
            <TresBoxGeometry :args="[0.4, 4, 1]" />
            <TresMeshStandardMaterial
              :color="LEFT_COLOR"
              emissive="#ff2222"
              :emissive-intensity="0.35"
            />
          </TresMesh>
        </RigidBody>

        <!-- Right wall -->
        <RigidBody type="fixed" collider="cuboid" :restitution="1" :friction="0">
          <TresMesh :position="[4, 0, 0]">
            <TresBoxGeometry :args="[0.4, 4, 1]" />
            <TresMeshStandardMaterial
              :color="RIGHT_COLOR"
              emissive="#2255ff"
              :emissive-intensity="0.35"
            />
          </TresMesh>
        </RigidBody>

        <BouncingBall :left-color="LEFT_COLOR" :right-color="RIGHT_COLOR" />
      </Physics>
    </Suspense>
  </Scene>
</template>
