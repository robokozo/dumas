<script setup lang="ts">
import { DumasEntity, useEcsComponent, createPhysics, createCylinderCollider } from "@dumas/core";

const props = defineProps<{
  startX: number;
  startY: number;
  startZ: number;
}>();

const emit = defineEmits<{
  scored: [];
}>();

let hasScored = false;

const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        body: createCylinderCollider({
          halfHeight: 0.06,
          radius: 0.38,
          restitution: 0.15,
          friction: 0.7,
        }),
      },
    }),
  },
  fn: ({ transform: t }) => {
    if (hasScored === false && t.posY.value < -1.5) {
      hasScored = true;
      emit("scored");
    }
  },
});

transform.posX.value = props.startX;
transform.posY.value = props.startY;
transform.posZ.value = props.startZ;
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresCylinderGeometry :args="[0.38, 0.38, 0.12, 16]" />
      <TresMeshStandardMaterial color="#f0c040" :metalness="0.8" :roughness="0.3" />
    </TresMesh>
  </DumasEntity>
</template>
