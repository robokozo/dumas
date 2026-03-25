<script setup lang="ts">
import { StatsGl } from "@tresjs/cientos";
import { DumasCanvas } from "@dumas/core";
</script>

<template>
  <DumasCanvas v-bind="$attrs">
    <StatsGl />
    <slot />
  </DumasCanvas>
</template>
