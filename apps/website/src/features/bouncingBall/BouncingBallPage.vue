<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import { TresLeches } from "@tresjs/leches";
import BouncingBallScene from "./BouncingBallScene.vue";
</script>

<template>
  <TresCanvas clear-color="#0f0a1e" window-size render-mode="always">
    <BouncingBallScene />
  </TresCanvas>
  <TresLeches />
</template>
