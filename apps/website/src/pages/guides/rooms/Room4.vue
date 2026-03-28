<script setup lang="ts">
import { Scene } from "@dumas/core";
import RoomScene from "./RoomScene.vue";
import RoomNav from "./RoomNav.vue";
import type { Exits, RoomTheme } from "./types";

const EXITS: Exits = { north: "room1", east: "room5", south: "room7" };

const THEME: RoomTheme = {
  floor: "#1a2e1a",
  wall: "#253a25",
  pillar: "#162416",
  ambientColor: "#284028",
  ambientIntensity: 0.8,
  lightColor: "#80c060",
  lightIntensity: 1.4,
  torchColor: "#50c040",
  torchIntensity: 16,
};
</script>

<template>
  <Scene name="room4">
    <RoomScene :exits="EXITS" :theme="THEME" />
    <template #overlay>
      <RoomNav :exits="EXITS" label="IV" />
    </template>
  </Scene>
</template>
