<script setup lang="ts">
import { computed, watch } from "vue";
import { inject } from "vue";
import { useGameObject, useRigidBody, useCollider } from "@dumas/core";
import { CRADLE_KEY } from "./cradleKey";

const props = defineProps<{ index: number }>();

const ctx = inject(CRADLE_KEY)!;

// Ball starts at its initial pendulum position
const initialAngle = ctx.state.angles[props.index];
const initialX = ctx.PIVOT_X[props.index] + ctx.STRING_LENGTH * Math.sin(initialAngle);
const initialY = ctx.PIVOT_Y - ctx.STRING_LENGTH * Math.cos(initialAngle);

const { groupRef, eid } = useGameObject({ position: [initialX, initialY, 0] });
const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });
useCollider({ eid, shape: "sphere", radius: ctx.BALL_RADIUS, restitution: 1.0, density: 1.0 });

// Register with scene so the physics system can drive this body
function tryRegister(body: typeof rigidBody.value): void {
  if (body !== null) {
    ctx.registerBody({ index: props.index, body: rigidBody });
  }
}

if (rigidBody.value !== null) {
  tryRegister(rigidBody.value);
} else {
  watch(
    rigidBody,
    (body) => {
      tryRegister(body);
    },
    { once: true },
  );
}

// String geometry — computed from the reactive angle each frame
const angle = computed(() => ctx.state.angles[props.index]);

const stringMidX = computed(
  () => ctx.PIVOT_X[props.index] + (ctx.STRING_LENGTH / 2) * Math.sin(angle.value),
);
const stringMidY = computed(() => ctx.PIVOT_Y - (ctx.STRING_LENGTH / 2) * Math.cos(angle.value));

// Front string at -STRING_Z, back string at +STRING_Z
const STRING_OFFSETS = [-ctx.STRING_Z, ctx.STRING_Z] as const;
const STRING_RADIUS = 0.012;
const SPHERE_SEGMENTS = 24;
</script>

<template>
  <!-- Two strings per ball (front and back) matching the frame rails -->
  <TresGroup
    v-for="(stringZ, si) in STRING_OFFSETS"
    :key="si"
    :position="[stringMidX, stringMidY, stringZ]"
    :rotation="[0, 0, angle]"
  >
    <TresMesh>
      <TresCylinderGeometry :args="[STRING_RADIUS, STRING_RADIUS, ctx.STRING_LENGTH, 4]" />
      <TresMeshStandardMaterial color="#aaaaaa" />
    </TresMesh>
  </TresGroup>

  <!-- Ball — position driven each frame by the kinematic body via renderSyncSystem -->
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresSphereGeometry :args="[ctx.BALL_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]" />
      <TresMeshStandardMaterial color="#c8ccd8" :metalness="0.95" :roughness="0.05" />
    </TresMesh>
  </TresGroup>
</template>
