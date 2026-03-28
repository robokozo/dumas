<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { west: "room2", south: "room6" };

const THEME: RoomTheme = {
  floor: "#1e1a30",
  wall: "#2a2540",
  pillar: "#1a1828",
  ambientColor: "#403080",
  ambientIntensity: 1.4,
  lightColor: "#8070c0",
  lightIntensity: 1.8,
  torchColor: "#6050cc",
  torchIntensity: 20,
};
</script>

<template>
  <Scene name="room3">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="III" />
    </template>
  </Scene>
</template>
