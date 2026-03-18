<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import { TresLeches } from "@tresjs/leches";
import NewtonsCradleScene from "./NewtonsCradleScene.vue";
</script>

<template>
  <TresCanvas clear-color="#1a1040" window-size render-mode="always">
    <NewtonsCradleScene />
  </TresCanvas>
  <TresLeches />
</template>
