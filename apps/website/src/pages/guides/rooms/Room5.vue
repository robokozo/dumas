<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { north: "room2", west: "room4", east: "room6", south: "room8" };

const THEME: RoomTheme = {
  floor: "#5a4e3c",
  wall: "#6a5e4c",
  pillar: "#504438",
  ambientColor: "#b09060",
  ambientIntensity: 0.5,
  lightColor: "#f0d880",
  lightIntensity: 1.4,
  torchColor: "#e0a030",
  torchIntensity: 14,
};
</script>

<template>
  <Scene name="room5" :default="true">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="V" />
    </template>
  </Scene>
</template>
