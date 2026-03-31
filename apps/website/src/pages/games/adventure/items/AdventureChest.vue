<script setup lang="ts">
import { useAdventureItem } from "../shared/useAdventureItem";
import type { Interaction } from "../shared/types";

const props = defineProps<{
  id: string;
  x: number;
  z: number;
  label: string;
  interactions: Array<Interaction>;
}>();

const { tryInteract } = useAdventureItem({
  id: props.id,
  x: props.x,
  z: props.z,
  label: props.label,
  interactions: props.interactions,
});
</script>

<template>
  <TresGroup :position="[x, 0, z]">
    <!-- Base -->
    <TresMesh :position="[0, 0.2, 0]">
      <TresBoxGeometry :args="[0.7, 0.38, 0.5]" />
      <TresMeshStandardMaterial color="#7a5020" />
    </TresMesh>
    <!-- Lid -->
    <TresMesh :position="[0, 0.49, 0]">
      <TresBoxGeometry :args="[0.7, 0.2, 0.5]" />
      <TresMeshStandardMaterial color="#8a6030" />
    </TresMesh>
    <!-- Latch -->
    <TresMesh :position="[0, 0.37, 0.26]">
      <TresBoxGeometry :args="[0.12, 0.1, 0.04]" />
      <TresMeshStandardMaterial color="#f0c040" :emissive="'#c09010'" :emissive-intensity="0.4" />
    </TresMesh>
    <!-- Invisible hitbox -->
    <TresMesh :position="[0, 0.35, 0]" @click.stop="() => tryInteract()">
      <TresBoxGeometry :args="[1.0, 0.8, 0.9]" />
      <TresMeshBasicMaterial :transparent="true" :opacity="0" />
    </TresMesh>
  </TresGroup>
</template>
