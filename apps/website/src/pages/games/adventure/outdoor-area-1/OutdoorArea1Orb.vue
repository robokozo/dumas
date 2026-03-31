<script setup lang="ts">
import AdventureOrb from "../items/AdventureOrb.vue";
import type { Interaction } from "../shared/types";

const INTERACTIONS: Array<Interaction> = [
  {
    label: "Touch it",
    response: "A warm pulse runs up your arm. You glimpse a distant mountain. Then nothing.",
  },
  {
    label: "Circle it",
    response: "It rotates to always face you. Unsettling, but at least it's polite.",
  },
  {
    label: "Talk to it",
    response: '"Hello?" The orb brightens briefly. You feel slightly foolish.',
  },
] satisfies Array<Interaction>;
</script>

<template>
  <AdventureOrb
    id="outdoor-area-1-orb"
    :x="1"
    :z="-4"
    label="Floating Orb"
    :interactions="INTERACTIONS"
  />
</template>
