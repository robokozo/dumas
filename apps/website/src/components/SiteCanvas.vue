<script setup lang="ts">
import { TresLeches, useControls } from "@tresjs/leches";
import { DumasCanvas } from "@dumas/core";

const isDebug = new URLSearchParams(window.location.search).get("debug") === "true";

if (isDebug === true) {
  useControls("fpsgraph");
}
</script>

<template>
  <TresLeches v-if="isDebug" />
  <DumasCanvas v-bind="$attrs">
    <slot />
  </DumasCanvas>
</template>
