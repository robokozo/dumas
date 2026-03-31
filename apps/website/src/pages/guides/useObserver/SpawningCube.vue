<script setup lang="ts">
import { DumasEntity, useEcsComponent } from "@dumas/core";

const props = defineProps<{ x: number; y: number; color: string }>();
const emit = defineEmits<{ mounted: [eid: number]; unmounted: [eid: number] }>();

const { eid, transform } = useEcsComponent({
  components: {},
  fn: ({ elapsed, transform }) => {
    const halfAngle = elapsed * 0.6;
    transform.rotX.value = 0;
    transform.rotY.value = Math.sin(halfAngle);
    transform.rotZ.value = 0;
    transform.rotW.value = Math.cos(halfAngle);
  },
});

transform.posX.value = props.x;
transform.posY.value = props.y;

emit("mounted", eid);
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresBoxGeometry :args="[0.7, 0.7, 0.7]" />
      <TresMeshStandardMaterial :color="color" />
    </TresMesh>
  </DumasEntity>
</template>
