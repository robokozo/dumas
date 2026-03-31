<script setup lang="ts">
import { ref } from "vue";
import { Scene, useEcsComponent, useSystem } from "@dumas/core";

const ORBITING_COLOR = "#ff6b6b";
const TRACKING_COLOR = "#4ecdc4";
const TUMBLING_COLOR = "#ffe66d";

const ORBIT_RADIUS = 3;

// Reactive position of the orbiting cube, used by the tracking cube's lookAt
const orbitX = ref(0);
const orbitZ = ref(0);

// ── Cube A: orbits on Y axis using setRotationY ──────────────────────────────
const { transform: orbitTransform } = useEcsComponent({ components: {} });
orbitTransform.posY.value = 0;

// ── Cube B: uses lookAt to always face Cube A ────────────────────────────────
const { transform: trackTransform } = useEcsComponent({ components: {} });
trackTransform.posX.value = 0;
trackTransform.posY.value = 0;
trackTransform.posZ.value = 0;

// ── Cube C: tumbles on all three axes using setEuler ─────────────────────────
const { transform: tumbleTransform } = useEcsComponent({ components: {} });
tumbleTransform.posX.value = -4;
tumbleTransform.posY.value = 0;
tumbleTransform.posZ.value = 0;

// ── Animation system ─────────────────────────────────────────────────────────
useSystem({
  fn: ({ elapsed }) => {
    // Cube A: orbit around the origin and rotate to face movement direction
    const x = Math.cos(elapsed) * ORBIT_RADIUS;
    const z = Math.sin(elapsed) * ORBIT_RADIUS;
    orbitTransform.posX.value = x;
    orbitTransform.posZ.value = z;
    orbitTransform.setRotationY({ angle: -elapsed });

    // Share position so the tracking cube can face it
    orbitX.value = x;
    orbitZ.value = z;

    // Cube B: face the orbiting cube
    trackTransform.lookAt({ x: orbitX.value, z: orbitZ.value });

    // Cube C: tumble on all three axes at different speeds
    tumbleTransform.setEuler({
      x: elapsed * 0.7,
      y: elapsed * 1.3,
      z: elapsed * 0.5,
    });
  },
});
</script>

<template>
  <Scene name="transform-helpers-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 6, 10]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.5" />

    <!-- Cube A: orbiting, setRotationY -->
    <TresMesh
      :position="[orbitTransform.posX.value, orbitTransform.posY.value, orbitTransform.posZ.value]"
      :quaternion="[
        orbitTransform.rotX.value,
        orbitTransform.rotY.value,
        orbitTransform.rotZ.value,
        orbitTransform.rotW.value,
      ]"
    >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="ORBITING_COLOR" />
    </TresMesh>

    <!-- Cube B: tracking, lookAt -->
    <TresMesh
      :position="[trackTransform.posX.value, trackTransform.posY.value, trackTransform.posZ.value]"
      :quaternion="[
        trackTransform.rotX.value,
        trackTransform.rotY.value,
        trackTransform.rotZ.value,
        trackTransform.rotW.value,
      ]"
    >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="TRACKING_COLOR" />
    </TresMesh>

    <!-- Cube C: tumbling, setEuler -->
    <TresMesh
      :position="[
        tumbleTransform.posX.value,
        tumbleTransform.posY.value,
        tumbleTransform.posZ.value,
      ]"
      :quaternion="[
        tumbleTransform.rotX.value,
        tumbleTransform.rotY.value,
        tumbleTransform.rotZ.value,
        tumbleTransform.rotW.value,
      ]"
    >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="TUMBLING_COLOR" />
    </TresMesh>

    <!-- Ground plane for visual reference -->
    <TresMesh :position="[0, -1, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[16, 16]" />
      <TresMeshStandardMaterial color="#1a1a2e" :opacity="0.4" :transparent="true" />
    </TresMesh>
  </Scene>
</template>
