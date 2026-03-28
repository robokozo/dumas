<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { north: "room3", west: "room5", south: "room9" };

const THEME: RoomTheme = {
  floor: "#2e1414",
  wall: "#3e2020",
  pillar: "#281010",
  ambientColor: "#802020",
  ambientIntensity: 0.8,
  lightColor: "#c04040",
  lightIntensity: 1.6,
  torchColor: "#cc2020",
  torchIntensity: 20,
};
</script>

<template>
  <Scene name="room6">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="VI" />
    </template>
  </Scene>
</template>
