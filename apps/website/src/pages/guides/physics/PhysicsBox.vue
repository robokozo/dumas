<script setup lang="ts">
import { DumasEntity, useEcsComponent, createPhysics, createCuboidCollider } from "@dumas/core";

const props = defineProps<{
  position: [number, number, number];
  color: string;
}>();

const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        box: createCuboidCollider({ halfExtents: [0.5, 0.5, 0.5] }),
      },
    }),
  },
});

// Physics reads these values in vueOnMounted before the first step.
transform.posX.value = props.position[0];
transform.posY.value = props.position[1];
transform.posZ.value = props.position[2];
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="color" />
    </TresMesh>
  </DumasEntity>
</template>
