<script setup lang="ts">
import { DumasEntity, useEcsComponent } from "@dumas/core";

const props = defineProps<{ x: number; color: string }>();

const { eid, transform } = useEcsComponent({ components: {} });
transform.posX.value = props.x;
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresBoxGeometry :args="[0.85, 0.85, 0.85]" />
      <TresMeshStandardMaterial :color="color" />
    </TresMesh>
  </DumasEntity>
</template>
