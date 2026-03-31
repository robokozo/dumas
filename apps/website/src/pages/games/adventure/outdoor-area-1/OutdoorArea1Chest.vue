<script setup lang="ts">
import AdventureChest from "../items/AdventureChest.vue";
import type { Interaction } from "../shared/types";

const INTERACTIONS: Array<Interaction> = [
  {
    label: "Open it",
    response:
      'The chest creaks open. Inside: a handful of coins and a crumpled note reading "Not here."',
  },
  {
    label: "Examine it",
    response: "Old wood, suspiciously new lock. Strange symbols are carved along the lid.",
  },
  { label: "Leave it", response: "You back away slowly. Some things are better left unopened." },
] satisfies Array<Interaction>;
</script>

<template>
  <AdventureChest
    id="outdoor-area-1-chest"
    :x="4"
    :z="1"
    label="Ancient Chest"
    :interactions="INTERACTIONS"
  />
</template>
