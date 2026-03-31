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
    <!-- Post -->
    <TresMesh :position="[0, 0.5, 0]">
      <TresBoxGeometry :args="[0.12, 1.0, 0.12]" />
      <TresMeshStandardMaterial color="#6b4a2a" />
    </TresMesh>
    <!-- Board -->
    <TresMesh :position="[0, 1.05, 0]" :rotation="[0, 0.25, 0]">
      <TresBoxGeometry :args="[0.8, 0.45, 0.08]" />
      <TresMeshStandardMaterial color="#a07840" />
    </TresMesh>
    <!-- Invisible hitbox -->
    <TresMesh :position="[0, 0.55, 0]" @click.stop="() => tryInteract()">
      <TresBoxGeometry :args="[1.0, 1.3, 0.9]" />
      <TresMeshBasicMaterial :transparent="true" :opacity="0" />
    </TresMesh>
  </TresGroup>
</template>
