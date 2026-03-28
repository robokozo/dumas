<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { north: "room5", west: "room7", east: "room9" };

const THEME: RoomTheme = {
  floor: "#2e1208",
  wall: "#3e2018",
  pillar: "#2a1006",
  ambientColor: "#a03010",
  ambientIntensity: 1.6,
  lightColor: "#e06030",
  lightIntensity: 1.8,
  torchColor: "#e04010",
  torchIntensity: 24,
};
</script>

<template>
  <Scene name="room8">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="VIII" />
    </template>
  </Scene>
</template>
