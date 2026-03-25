<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import type { TresCanvasProps } from "@tresjs/core";
import { createWorldContext } from "../composables/useWorld";
import DumasWorld from "./DumasWorld.vue";
import type { Vec3 } from "../types";

const props = defineProps<
  TresCanvasProps & {
    gravity?: Vec3;
    fixedTimestep?: number;
  }
>();

const ctx = createWorldContext({ gravity: props.gravity, fixedTimestep: props.fixedTimestep });
</script>

<template>
  <TresCanvas v-bind="$attrs">
    <DumasWorld :ctx="ctx">
      <slot />
    </DumasWorld>
  </TresCanvas>
</template>
