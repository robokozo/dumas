<script setup lang="ts">
import {
  Scene,
  useEcsComponent,
  usePhysics,
  createPhysics,
  createCuboidCollider,
} from "@dumas/core";
import BouncingBall from "./BouncingBall.vue";

const LEFT_COLOR = "#ff4444";
const RIGHT_COLOR = "#4488ff";

usePhysics({ gravity: [0, 0, 0] });

// Left wall — fixed body at x: -4
const { transform: leftTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [0.2, 2, 0.5], restitution: 1, friction: 0 }),
      },
    }),
  },
});
leftTransform.posX.value = -4;

// Right wall — fixed body at x: 4
const { transform: rightTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [0.2, 2, 0.5], restitution: 1, friction: 0 }),
      },
    }),
  },
});
rightTransform.posX.value = 4;
</script>

<template>
  <Scene name="demo" :default="true">
    <TresPerspectiveCamera :position="[0, 1, 20]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[0, 5, 5]" :intensity="1.5" />

    <!-- Left wall visual -->
    <TresMesh :position="[-4, 0, 0]">
      <TresBoxGeometry :args="[0.4, 4, 1]" />
      <TresMeshStandardMaterial :color="LEFT_COLOR" emissive="#ff2222" :emissive-intensity="0.35" />
    </TresMesh>

    <!-- Right wall visual -->
    <TresMesh :position="[4, 0, 0]">
      <TresBoxGeometry :args="[0.4, 4, 1]" />
      <TresMeshStandardMaterial
        :color="RIGHT_COLOR"
        emissive="#2255ff"
        :emissive-intensity="0.35"
      />
    </TresMesh>

    <BouncingBall :left-color="LEFT_COLOR" :right-color="RIGHT_COLOR" />
  </Scene>
</template>
