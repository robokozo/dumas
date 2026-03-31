<script setup lang="ts">
import { Game } from "@dumas/core";
import ForestScene from "./forest/ForestScene.vue";
import CaveScene from "./cave/CaveScene.vue";
</script>

<template>
  <Game style="width: 100%; height: 100%">
    <ForestScene />
    <CaveScene />
  </Game>
</template>
