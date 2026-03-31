<script setup lang="ts">
import { DumasEntity, useEcsComponent } from "@dumas/core";

const CUBE_SIZE = 0.75;
const WAVE_SPEED = 2.5;
const WAVE_AMPLITUDE = 1.5;
const SPIN_SPEED = 1.2;

const props = defineProps<{ startX: number; color: string; phase: number }>();

const { eid, transform } = useEcsComponent({
  components: {},
  fn: ({ transform, elapsed }) => {
    transform.posY.value = Math.sin(elapsed * WAVE_SPEED + props.phase) * WAVE_AMPLITUDE;
    transform.setRotationY({ angle: (elapsed * SPIN_SPEED + props.phase * 0.5) * 2 });
  },
});

transform.posX.value = props.startX;
transform.posY.value = Math.sin(props.phase) * WAVE_AMPLITUDE;
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresBoxGeometry :args="[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]" />
      <TresMeshStandardMaterial :color="color" />
    </TresMesh>
  </DumasEntity>
</template>
