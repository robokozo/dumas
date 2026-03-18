<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import { TresLeches } from "@tresjs/leches";
import BlockWallScene from "./BlockWallScene.vue";
</script>

<template>
  <TresCanvas clear-color="#0a1e2e" window-size render-mode="always">
    <BlockWallScene />
  </TresCanvas>
  <TresLeches />
</template>
