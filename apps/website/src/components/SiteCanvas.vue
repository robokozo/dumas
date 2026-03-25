<script setup lang="ts">
import { TresLeches, useControls } from "@tresjs/leches";
import { DumasCanvas } from "@dumas/core";

useControls("fpsgraph");
</script>

<template>
  <TresLeches />
  <DumasCanvas v-bind="$attrs">
    <slot />
  </DumasCanvas>
</template>
