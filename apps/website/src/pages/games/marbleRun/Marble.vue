<script setup lang="ts">
import { DumasEntity, useEcsComponent, createPhysics, createSphereCollider } from "@dumas/core";
import {
  MARBLE_RADIUS,
  MARBLE_RESTITUTION,
  MARBLE_FRICTION,
  MARBLE_COLORS,
  GOAL_Y,
} from "./constants";

const FALL_THRESHOLD = GOAL_Y - 3;

const props = defineProps<{
  startX: number;
  startY: number;
  startZ: number;
  colorIndex: number;
}>();

const emit = defineEmits<{
  fell: [];
}>();

const color = MARBLE_COLORS[props.colorIndex % MARBLE_COLORS.length];

let hasFallen = false;

const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        ball: createSphereCollider({
          radius: MARBLE_RADIUS,
          restitution: MARBLE_RESTITUTION,
          friction: MARBLE_FRICTION,
        }),
      },
    }),
  },
  fn: ({ transform: t }) => {
    if (hasFallen === false && t.posY.value < FALL_THRESHOLD) {
      hasFallen = true;
      emit("fell");
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
      <TresSphereGeometry :args="[MARBLE_RADIUS, 24, 24]" />
      <TresMeshStandardMaterial
        :color="color"
        :emissive="color"
        :emissive-intensity="0.3"
        :metalness="0.6"
        :roughness="0.2"
      />
    </TresMesh>
  </DumasEntity>
</template>
