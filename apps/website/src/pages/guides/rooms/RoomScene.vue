<script setup lang="ts">
import { computed } from "vue";
import { entryPoint } from "./state";
import type { Exits, RoomTheme } from "./types";

const { exits, theme } = defineProps<{
  exits: Exits;
  theme: RoomTheme;
}>();

// Character spawns at the door the player entered through.
const characterPos = computed((): [number, number, number] => {
  const p = entryPoint.value;
  if (p === "from-north") return [0, 0.7, -3];
  if (p === "from-south") return [0, 0.7, 3];
  if (p === "from-west") return [-3, 0.7, 0];
  if (p === "from-east") return [3, 0.7, 0];
  return [0, 0.7, 0];
});
</script>

<template>
  <TresPerspectiveCamera :position="[0, 15, 7]" :look-at="[0, 0, 0]" :fov="45" />
  <TresAmbientLight :color="theme.ambientColor" :intensity="theme.ambientIntensity" />
  <TresDirectionalLight
    :position="[3, 8, 5]"
    :color="theme.lightColor"
    :intensity="theme.lightIntensity"
  />
  <TresPointLight
    :position="[-3.5, 3.2, -4.2]"
    :color="theme.torchColor"
    :intensity="theme.torchIntensity"
    :distance="9"
  />
  <TresPointLight
    :position="[3.5, 3.2, -4.2]"
    :color="theme.torchColor"
    :intensity="theme.torchIntensity"
    :distance="9"
  />

  <!-- Floor -->
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial :color="theme.floor" />
  </TresMesh>

  <!-- North wall (z = -5) -->
  <template v-if="exits.north !== undefined">
    <TresMesh :position="[-3, 2, -5]">
      <TresBoxGeometry :args="[4, 4, 0.4]" />
      <TresMeshStandardMaterial :color="theme.wall" />
    </TresMesh>
    <TresMesh :position="[3, 2, -5]">
      <TresBoxGeometry :args="[4, 4, 0.4]" />
      <TresMeshStandardMaterial :color="theme.wall" />
    </TresMesh>
  </template>
  <TresMesh v-else :position="[0, 2, -5]">
    <TresBoxGeometry :args="[10, 4, 0.4]" />
    <TresMeshStandardMaterial :color="theme.wall" />
  </TresMesh>

  <!-- South wall (z = 5) -->
  <template v-if="exits.south !== undefined">
    <TresMesh :position="[-3, 2, 5]">
      <TresBoxGeometry :args="[4, 4, 0.4]" />
      <TresMeshStandardMaterial :color="theme.wall" />
    </TresMesh>
    <TresMesh :position="[3, 2, 5]">
      <TresBoxGeometry :args="[4, 4, 0.4]" />
      <TresMeshStandardMaterial :color="theme.wall" />
    </TresMesh>
  </template>
  <TresMesh v-else :position="[0, 2, 5]">
    <TresBoxGeometry :args="[10, 4, 0.4]" />
    <TresMeshStandardMaterial :color="theme.wall" />
  </TresMesh>

  <!-- West wall (x = -5) -->
  <template v-if="exits.west !== undefined">
    <TresMesh :position="[-5, 2, -3]">
      <TresBoxGeometry :args="[0.4, 4, 4]" />
      <TresMeshStandardMaterial :color="theme.wall" />
    </TresMesh>
    <TresMesh :position="[-5, 2, 3]">
      <TresBoxGeometry :args="[0.4, 4, 4]" />
      <TresMeshStandardMaterial :color="theme.wall" />
    </TresMesh>
  </template>
  <TresMesh v-else :position="[-5, 2, 0]">
    <TresBoxGeometry :args="[0.4, 4, 10]" />
    <TresMeshStandardMaterial :color="theme.wall" />
  </TresMesh>

  <!-- East wall (x = 5) -->
  <template v-if="exits.east !== undefined">
    <TresMesh :position="[5, 2, -3]">
      <TresBoxGeometry :args="[0.4, 4, 4]" />
      <TresMeshStandardMaterial :color="theme.wall" />
    </TresMesh>
    <TresMesh :position="[5, 2, 3]">
      <TresBoxGeometry :args="[0.4, 4, 4]" />
      <TresMeshStandardMaterial :color="theme.wall" />
    </TresMesh>
  </template>
  <TresMesh v-else :position="[5, 2, 0]">
    <TresBoxGeometry :args="[0.4, 4, 10]" />
    <TresMeshStandardMaterial :color="theme.wall" />
  </TresMesh>

  <!-- Pillars at back corners -->
  <TresMesh :position="[-3.5, 2, -4.5]">
    <TresCylinderGeometry :args="[0.3, 0.3, 4, 8]" />
    <TresMeshStandardMaterial :color="theme.pillar" />
  </TresMesh>
  <TresMesh :position="[3.5, 2, -4.5]">
    <TresCylinderGeometry :args="[0.3, 0.3, 4, 8]" />
    <TresMeshStandardMaterial :color="theme.pillar" />
  </TresMesh>

  <!-- Character -->
  <TresMesh :position="characterPos">
    <TresCapsuleGeometry :args="[0.35, 0.7, 4, 8]" />
    <TresMeshStandardMaterial color="#e8dcc8" />
  </TresMesh>
</template>
