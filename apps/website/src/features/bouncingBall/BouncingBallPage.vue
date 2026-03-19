<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import { TresLeches } from "@tresjs/leches";
import { DumasProvider } from "@dumas/core";
import BouncingBallScene from "./BouncingBallScene.vue";
</script>

<template>
  <TresCanvas clear-color="#0f0a1e" window-size render-mode="always">
    <DumasProvider :gravity="{ x: 0, y: -9.81, z: 0 }">
      <BouncingBallScene />
    </DumasProvider>
  </TresCanvas>
  <TresLeches />
</template>
