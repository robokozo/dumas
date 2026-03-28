<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { west: "room1", east: "room3", south: "room5" };

const THEME: RoomTheme = {
  floor: "#1a2535",
  wall: "#263044",
  pillar: "#1c2840",
  ambientColor: "#304880",
  ambientIntensity: 1.8,
  lightColor: "#8090d0",
  lightIntensity: 2.0,
  torchColor: "#4468cc",
  torchIntensity: 22,
};
</script>

<template>
  <Scene name="room2">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="II" />
    </template>
  </Scene>
</template>
