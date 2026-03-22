<script setup lang="ts">
import { ref } from "vue";
import { watchOnce } from "@vueuse/core";
import { useGameObject, useRigidBody, useCollider, useCollisionHandler } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";

const WALL_X = 5.5;
const WALL_HALF_WIDTH = 0.3;
const WALL_HALF_HEIGHT = 2;
const WALL_HALF_DEPTH = 1;
const BALL_RADIUS = 0.4;
const INITIAL_SPEED = 8;
const MIN_SPEED = 6;
const RESTITUTION = 1.0;

const ballColor = ref<string>("#888");

const leftWall = useGameObject({ position: [-WALL_X, 0, 0] });
useRigidBody({ eid: leftWall.eid, type: "fixed" });
useCollider({
  eid: leftWall.eid,
  shape: "box",
  args: [WALL_HALF_WIDTH, WALL_HALF_HEIGHT, WALL_HALF_DEPTH],
  restitution: RESTITUTION,
  friction: 0,
});

const rightWall = useGameObject({ position: [WALL_X, 0, 0] });
useRigidBody({ eid: rightWall.eid, type: "fixed" });
useCollider({
  eid: rightWall.eid,
  shape: "box",
  args: [WALL_HALF_WIDTH, WALL_HALF_HEIGHT, WALL_HALF_DEPTH],
  restitution: RESTITUTION,
  friction: 0,
});

const ball = useGameObject({ position: [0, 0, 0] });
const { rigidBody: ballBody } = useRigidBody({ eid: ball.eid, type: "dynamic" });
useCollider({
  eid: ball.eid,
  shape: "sphere",
  radius: BALL_RADIUS,
  restitution: RESTITUTION,
  friction: 0,
});

watchOnce(
  ballBody,
  (rb) => {
    if (rb === null) return;
    rb.setGravityScale(0, true);
    rb.setLinvel({ x: INITIAL_SPEED, y: 0, z: 0 }, true);
  },
  { immediate: true },
);

useCollisionHandler({
  eid: ball.eid,
  handler: (event) => {
    if (event.type !== "started") return;
    const rb = ballBody.value;
    if (rb === null) return;

    const hitEid = event.eidA === ball.eid ? event.eidB : event.eidA;
    if (hitEid !== leftWall.eid && hitEid !== rightWall.eid) return;

    // Ensure the ball never slows down below minimum speed
    const vel = rb.linvel();
    if (Math.abs(vel.x) < MIN_SPEED) {
      rb.setLinvel({ x: Math.sign(vel.x) * MIN_SPEED, y: 0, z: 0 }, true);
    }

    if (hitEid === leftWall.eid) {
      ballColor.value = "#f64";
    } else {
      ballColor.value = "#4af";
    }
  },
});
</script>

<template>
  <TresPerspectiveCamera :position="[0, 0, 14]" :look-at="[0, 0, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight :position="[5, 8, 5]" :intensity="1" />

  <!-- Left wall (red) -->
  <TresGroup
    :ref="
      (el: any) => {
        leftWall.groupRef.value = el;
      }
    "
  >
    <TresMesh>
      <TresBoxGeometry :args="[WALL_HALF_WIDTH * 2, WALL_HALF_HEIGHT * 2, WALL_HALF_DEPTH * 2]" />
      <TresMeshStandardMaterial color="#f64" />
    </TresMesh>
  </TresGroup>

  <!-- Right wall (blue) -->
  <TresGroup
    :ref="
      (el: any) => {
        rightWall.groupRef.value = el;
      }
    "
  >
    <TresMesh>
      <TresBoxGeometry :args="[WALL_HALF_WIDTH * 2, WALL_HALF_HEIGHT * 2, WALL_HALF_DEPTH * 2]" />
      <TresMeshStandardMaterial color="#4af" />
    </TresMesh>
  </TresGroup>

  <!-- Ball -->
  <TresGroup
    :ref="
      (el: any) => {
        ball.groupRef.value = el;
      }
    "
  >
    <TresMesh>
      <TresSphereGeometry :args="[BALL_RADIUS, 32, 32]" />
      <TresMeshStandardMaterial :color="ballColor" :metalness="0.3" :roughness="0.4" />
    </TresMesh>
  </TresGroup>
</template>
