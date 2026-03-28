<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { north: "room6", west: "room8" };

const THEME: RoomTheme = {
  floor: "#2a1228",
  wall: "#3a2038",
  pillar: "#221020",
  ambientColor: "#703040",
  ambientIntensity: 1.0,
  lightColor: "#c06080",
  lightIntensity: 1.6,
  torchColor: "#c02060",
  torchIntensity: 20,
};
</script>

<template>
  <Scene name="room9">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="IX" />
    </template>
  </Scene>
</template>
