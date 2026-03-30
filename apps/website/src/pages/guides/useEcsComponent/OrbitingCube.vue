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
    // Derive the full Y-axis quaternion from elapsed so it stays normalized.
    // rotX = 0, rotZ = 0 (pure Y rotation), rotY = sin(θ/2), rotW = cos(θ/2).
    const halfAngle = elapsed * SPIN_SPEED + props.phase * 0.5;
    transform.rotY.value = Math.sin(halfAngle);
    transform.rotW.value = Math.cos(halfAngle);
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
