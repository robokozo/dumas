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
    <!-- Pedestal -->
    <TresMesh :position="[0, 0.2, 0]">
      <TresCylinderGeometry :args="[0.14, 0.24, 0.4, 8]" />
      <TresMeshStandardMaterial color="#3a3a5a" />
    </TresMesh>
    <!-- Orb -->
    <TresMesh :position="[0, 0.72, 0]">
      <TresSphereGeometry :args="[0.28, 16, 12]" />
      <TresMeshStandardMaterial
        color="#40c0e0"
        :emissive="'#20a0c0'"
        :emissive-intensity="0.9"
        :transparent="true"
        :opacity="0.88"
      />
    </TresMesh>
    <!-- Glow ring -->
    <TresMesh :position="[0, 0.72, 0]" :rotation="[Math.PI / 2, 0, 0]">
      <TresTorusGeometry :args="[0.4, 0.04, 6, 24]" />
      <TresMeshStandardMaterial color="#80e8ff" :emissive="'#40c0f0'" :emissive-intensity="1.2" />
    </TresMesh>
    <!-- Invisible hitbox -->
    <TresMesh :position="[0, 0.5, 0]" @click.stop="() => tryInteract()">
      <TresCylinderGeometry :args="[0.7, 0.7, 1.0, 8]" />
      <TresMeshBasicMaterial :transparent="true" :opacity="0" />
    </TresMesh>
  </TresGroup>
</template>
