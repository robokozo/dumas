<script setup lang="ts">
import AdventureSign from "../items/AdventureSign.vue";
import type { Interaction } from "../shared/types";

const INTERACTIONS: Array<Interaction> = [
  {
    label: "Read it",
    response:
      '"DANGER: The forest ahead is cursed. Turn back." — scrawled beneath in fresh ink: "(we\'re also out of milk)"',
  },
  { label: "Ignore it", response: "Signs are just suggestions. You've got places to be." },
] satisfies Array<Interaction>;
</script>

<template>
  <AdventureSign
    id="outdoor-area-1-sign"
    :x="-4"
    :z="-1"
    label="Wooden Sign"
    :interactions="INTERACTIONS"
  />
</template>
