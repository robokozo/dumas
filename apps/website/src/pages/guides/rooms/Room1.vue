<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { east: "room2", south: "room4" };

const THEME: RoomTheme = {
  floor: "#1e2d1e",
  wall: "#2a3d2a",
  pillar: "#1a281a",
  ambientColor: "#305030",
  ambientIntensity: 0.9,
  lightColor: "#70c060",
  lightIntensity: 1.4,
  torchColor: "#40b040",
  torchIntensity: 14,
};
</script>

<template>
  <Scene name="room1">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="I" />
    </template>
  </Scene>
</template>
