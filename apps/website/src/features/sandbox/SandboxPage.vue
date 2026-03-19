<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import SandboxScene from "./SandboxScene.vue";
</script>

<template>
  <TresCanvas clear-color="#111" window-size render-mode="always">
    <SandboxScene />
  </TresCanvas>
</template>
