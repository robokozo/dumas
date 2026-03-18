<script setup lang="ts">
import { reactive, provide } from "vue";
import type { ShallowRef } from "vue";
import type RAPIER from "@dimforge/rapier3d-compat";
import { useWorld, useSystem } from "@dumas/core";
import { useControls } from "@tresjs/leches";
import { OrbitControls } from "@tresjs/cientos";
import CradleBall from "./CradleBall.vue";
import CradleFrame from "./CradleFrame.vue";
import { CRADLE_KEY } from "./cradleKey";
import type { CradleContext } from "./cradleKey";

const BALL_COUNT = 5;
const BALL_RADIUS = 0.4;
const STRING_LENGTH = 3.2;
const PIVOT_Y = 5.0;
const STRING_Z = 0.5;
const GRAVITY = 9.81;

// Balls are just touching at rest: spacing = diameter
const SPACING = BALL_RADIUS * 2;
const PIVOT_X = Array.from({ length: BALL_COUNT }, (_, i) => (i - (BALL_COUNT - 1) / 2) * SPACING);

useWorld({ gravity: { x: 0, y: -GRAVITY, z: 0 } });
useControls({ fps: { type: "fpsgraph" } });

const state = reactive({
  angles: Array.from({ length: BALL_COUNT }, () => 0),
  omegas: Array.from({ length: BALL_COUNT }, () => 0),
});

// Bodies registry — balls inject themselves when their rigid body is ready
const bodies: Array<ShallowRef<RAPIER.RigidBody | null>> = Array.from(
  { length: BALL_COUNT },
  () => ({ value: null }) as ShallowRef<RAPIER.RigidBody | null>,
);

function registerBody({
  index,
  body,
}: {
  index: number;
  body: ShallowRef<RAPIER.RigidBody | null>;
}): void {
  bodies[index] = body;
}

const controls = useControls({
  initialAngle: { value: 45, min: 10, max: 90, step: 1 },
  Reset: {
    type: "button",
    onClick: () => {
      const radians = (controls.initialAngle.value * Math.PI) / 180;
      for (let i = 0; i < BALL_COUNT; i++) {
        state.angles[i] = 0;
        state.omegas[i] = 0;
      }
      // Pull ball 0 to the left (negative angle)
      state.angles[0] = -radians;
    },
  },
});

// Set initial pull on ball 0
state.angles[0] = -(controls.initialAngle.value * Math.PI) / 180;

provide<CradleContext>(CRADLE_KEY, {
  state,
  PIVOT_X,
  PIVOT_Y,
  STRING_LENGTH,
  BALL_RADIUS,
  STRING_Z,
  registerBody,
});

// Pendulum physics + elastic collision cascade
useSystem({
  fn: ({ delta }) => {
    // Cap delta to avoid instability on slow frames
    const dt = Math.min(delta, 0.033);

    // Integrate pendulum ODE: α = -(g/L)·sin(θ)
    for (let i = 0; i < BALL_COUNT; i++) {
      const alpha = -(GRAVITY / STRING_LENGTH) * Math.sin(state.angles[i]);
      state.omegas[i] += alpha * dt;
      state.angles[i] += state.omegas[i] * dt;
    }

    // Elastic collision between adjacent balls (equal mass → swap velocities).
    // Multiple passes propagate the impulse chain in a single frame.
    const contactDistSq = BALL_RADIUS * 2 * (BALL_RADIUS * 2);

    for (let pass = 0; pass < BALL_COUNT - 1; pass++) {
      for (let i = 0; i < BALL_COUNT - 1; i++) {
        const xA = PIVOT_X[i] + STRING_LENGTH * Math.sin(state.angles[i]);
        const yA = PIVOT_Y - STRING_LENGTH * Math.cos(state.angles[i]);
        const xB = PIVOT_X[i + 1] + STRING_LENGTH * Math.sin(state.angles[i + 1]);
        const yB = PIVOT_Y - STRING_LENGTH * Math.cos(state.angles[i + 1]);

        const dx = xB - xA;
        const dy = yB - yA;
        const distSq = dx * dx + dy * dy;

        // relOmega > 0 means ball i is approaching ball i+1
        const relOmega = state.omegas[i] - state.omegas[i + 1];

        if (distSq <= contactDistSq && relOmega > 0) {
          const tmp = state.omegas[i];
          state.omegas[i] = state.omegas[i + 1];
          state.omegas[i + 1] = tmp;
        }
      }
    }

    // Drive kinematic bodies to their pendulum positions
    for (let i = 0; i < BALL_COUNT; i++) {
      const body = bodies[i].value;
      if (body === null) continue;

      const x = PIVOT_X[i] + STRING_LENGTH * Math.sin(state.angles[i]);
      const y = PIVOT_Y - STRING_LENGTH * Math.cos(state.angles[i]);
      body.setNextKinematicTranslation({ x, y, z: 0 });
    }
  },
  priority: 0,
});
</script>

<template>
  <TresPerspectiveCamera :position="[0, 4, 10]" :look-at="[0, 3, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.2" cast-shadow />

  <CradleFrame :pivot-y="PIVOT_Y" :half-span="((BALL_COUNT - 1) / 2) * SPACING + 0.8" />

  <CradleBall v-for="i in BALL_COUNT" :key="i - 1" :index="i - 1" />
</template>
