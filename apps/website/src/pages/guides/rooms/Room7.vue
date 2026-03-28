<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { north: "room4", east: "room8" };

const THEME: RoomTheme = {
  floor: "#2a1e10",
  wall: "#3a2e1c",
  pillar: "#20180a",
  ambientColor: "#603020",
  ambientIntensity: 0.8,
  lightColor: "#c08040",
  lightIntensity: 1.6,
  torchColor: "#b06020",
  torchIntensity: 18,
};
</script>

<template>
  <Scene name="room7">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="VII" />
    </template>
  </Scene>
</template>
