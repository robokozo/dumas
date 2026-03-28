<script setup lang="ts">
import { computed } from "vue";
import { Scene, useGame } from "@dumas/core";
import RoomNav from "./RoomNav.vue";
import NavButton from "./NavButton.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { north: "room4", east: "room8" };

const THEME: RoomTheme = {
  floor: "#3c2c18",
  wall: "#4e3c28",
  pillar: "#2e2010",
  ambientColor: "#a87850",
  ambientIntensity: 2.8,
  lightColor: "#d0a870",
  lightIntensity: 4.0,
  torchColor: "#d08040",
  torchIntensity: 55,
};

const { transitionState } = useGame();

const characterPos = computed((): [number, number, number] => {
  const from = transitionState.value.from as string | undefined;
  if (from === EXITS.north) return [0, 0.7, -3];
  if (from === EXITS.south) return [0, 0.7, 3];
  if (from === EXITS.west) return [-3, 0.7, 0];
  if (from === EXITS.east) return [3, 0.7, 0];
  return [0, 0.7, 0];
});
</script>

<template>
  <Scene name="room7">
    <TresPerspectiveCamera :position="[0, 15, 7]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :color="THEME.ambientColor" :intensity="THEME.ambientIntensity" />
    <TresDirectionalLight
      :position="[3, 8, 5]"
      :color="THEME.lightColor"
      :intensity="THEME.lightIntensity"
    />
    <TresPointLight
      :position="[-3.5, 3.2, -4.2]"
      :color="THEME.torchColor"
      :intensity="THEME.torchIntensity"
      :distance="14"
    />
    <TresPointLight
      :position="[3.5, 3.2, -4.2]"
      :color="THEME.torchColor"
      :intensity="THEME.torchIntensity"
      :distance="14"
    />

    <!-- Floor -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[10, 10]" />
      <TresMeshStandardMaterial :color="THEME.floor" />
    </TresMesh>

    <!-- North wall: door gap -->
    <TresMesh :position="[-3, 2, -5]">
      <TresBoxGeometry :args="[4, 4, 0.4]" />
      <TresMeshStandardMaterial :color="THEME.wall" />
    </TresMesh>
    <TresMesh :position="[3, 2, -5]">
      <TresBoxGeometry :args="[4, 4, 0.4]" />
      <TresMeshStandardMaterial :color="THEME.wall" />
    </TresMesh>

    <!-- South wall: solid -->
    <TresMesh :position="[0, 2, 5]">
      <TresBoxGeometry :args="[10, 4, 0.4]" />
      <TresMeshStandardMaterial :color="THEME.wall" />
    </TresMesh>

    <!-- West wall: solid -->
    <TresMesh :position="[-5, 2, 0]">
      <TresBoxGeometry :args="[0.4, 4, 10]" />
      <TresMeshStandardMaterial :color="THEME.wall" />
    </TresMesh>

    <!-- East wall: door gap -->
    <TresMesh :position="[5, 2, -3]">
      <TresBoxGeometry :args="[0.4, 4, 4]" />
      <TresMeshStandardMaterial :color="THEME.wall" />
    </TresMesh>
    <TresMesh :position="[5, 2, 3]">
      <TresBoxGeometry :args="[0.4, 4, 4]" />
      <TresMeshStandardMaterial :color="THEME.wall" />
    </TresMesh>

    <!-- Pillars -->
    <TresMesh :position="[-3.5, 2, -4.5]">
      <TresCylinderGeometry :args="[0.3, 0.3, 4, 8]" />
      <TresMeshStandardMaterial :color="THEME.pillar" />
    </TresMesh>
    <TresMesh :position="[3.5, 2, -4.5]">
      <TresCylinderGeometry :args="[0.3, 0.3, 4, 8]" />
      <TresMeshStandardMaterial :color="THEME.pillar" />
    </TresMesh>

    <!-- Character -->
    <TresMesh :position="characterPos">
      <TresCapsuleGeometry :args="[0.35, 0.7, 4, 8]" />
      <TresMeshStandardMaterial color="#e8dcc8" />
    </TresMesh>

    <template #overlay>
      <RoomNav>
        <template #north><NavButton to="room4">↑</NavButton></template>
        <template #east><NavButton to="room8">→</NavButton></template>
        <template #center>VII</template>
      </RoomNav>
    </template>
  </Scene>
</template>
