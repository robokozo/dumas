<script setup lang="ts">
import { shallowReactive, provide, watch } from "vue";
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";
import Ball from "./Ball.vue";
import Bowl from "./Bowl.vue";

const PLATE_ROTATION_SPEED = 0.4;
const PLATE_RADIUS = 3;
const PLATE_HALF_HEIGHT = 0.1;
const BOWL_RADIUS_ON_PLATE = 2.4;
const DROPPER_Y = 5;
const JITTER = 0.2;

const BOWLS = [
  { angle: 0, points: 100, color: "#ff3333" },
  { angle: (Math.PI * 2) / 8, points: 10, color: "#ffffff" },
  { angle: (Math.PI * 4) / 8, points: 10, color: "#ffffff" },
  { angle: (Math.PI * 6) / 8, points: 10, color: "#ffffff" },
  { angle: (Math.PI * 8) / 8, points: 100, color: "#ff3333" },
  { angle: (Math.PI * 10) / 8, points: 10, color: "#ffffff" },
  { angle: (Math.PI * 12) / 8, points: 10, color: "#ffffff" },
  { angle: (Math.PI * 14) / 8, points: 10, color: "#ffffff" },
] as const;

const props = defineProps<{
  ballsRemaining: number;
  dropTrigger: number;
  resetKey: number;
}>();

const emit = defineEmits<{
  score: [points: number];
  ballUsed: [];
}>();

// Plate angle — shared with Bowl systems via closure
let plateAngle = 0;
function getPlateAngle(): number {
  return plateAngle;
}

// Ball lifecycle tracking
interface BallState {
  id: number;
  spawnX: number;
  spawnZ: number;
}
let nextBallId = 0;
const balls = shallowReactive<Array<BallState>>([]);
const ballEids = new Set<number>();
const destroyEids = new Set<number>();
const scoredBalls = new Set<number>();
const ballIdToEid = new Map<number, number>();

provide("ballEids", ballEids);
provide("destroyEids", destroyEids);
provide("ballIdToEid", ballIdToEid);

function dropBall(): void {
  if (props.ballsRemaining <= 0) return;
  const id = nextBallId++;
  balls.push({
    id,
    spawnX: (Math.random() - 0.5) * JITTER,
    spawnZ: BOWL_RADIUS_ON_PLATE + (Math.random() - 0.5) * JITTER,
  });
  emit("ballUsed");
}

watch(
  () => props.dropTrigger,
  (val, prev) => {
    if (val !== prev) {
      dropBall();
    }
  },
);

watch(
  () => props.resetKey,
  () => {
    balls.splice(0, balls.length);
    scoredBalls.clear();
    destroyEids.clear();
  },
);

function onBallDestroyed(id: number): void {
  const eid = ballIdToEid.get(id);
  if (eid !== undefined) {
    scoredBalls.delete(eid);
    destroyEids.delete(eid);
  }
  const index = balls.findIndex((b) => b.id === id);
  if (index !== -1) {
    balls.splice(index, 1);
  }
}

function onBowlScore(ballEid: number, points: number): void {
  if (scoredBalls.has(ballEid)) return;
  scoredBalls.add(ballEid);
  destroyEids.add(ballEid);
  emit("score", points);
}

// Rotating plate
const { eid: plateEid, groupRef: plateGroupRef } = useGameObject({
  position: { x: 0, y: 0, z: 0 },
});
const { rigidBody: plateBody } = useRigidBody({ eid: plateEid, type: "kinematicPosition" });
useCollider({ eid: plateEid, shape: "box", args: [PLATE_RADIUS, PLATE_HALF_HEIGHT, PLATE_RADIUS] });

useSystem({
  fn: ({ delta }) => {
    const body = plateBody.value;
    if (body === null) return;
    plateAngle += delta * PLATE_ROTATION_SPEED;
    const halfAngle = plateAngle / 2;
    body.setNextKinematicRotation({ x: 0, y: Math.sin(halfAngle), z: 0, w: Math.cos(halfAngle) });
  },
});

function setPlateGroupRef(el: object | null): void {
  plateGroupRef.value = el as (typeof plateGroupRef)["value"];
}
</script>

<template>
  <TresPerspectiveCamera :position="[0, 9, 9]" :look-at="[0, 0, 0]" />
  <TresAmbientLight :intensity="0.6" />
  <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.3" cast-shadow />
  <TresDirectionalLight :position="[-4, 6, -4]" :intensity="0.4" />

  <!-- Dropper device — positioned over the bowl track, closest to camera -->
  <TresMesh :position="[0, DROPPER_Y, BOWL_RADIUS_ON_PLATE]">
    <TresCylinderGeometry :args="[0.12, 0.18, 0.8, 16]" />
    <TresMeshStandardMaterial
      color="#aaaacc"
      :emissive="'#6666aa'"
      :emissive-intensity="0.4"
      :roughness="0.4"
    />
  </TresMesh>

  <!-- Rotating plate (visual bowls are children — rotate with plate) -->
  <TresGroup
    :ref="
      (el: any) => {
        setPlateGroupRef(el);
      }
    "
  >
    <!-- Plate disc -->
    <TresMesh>
      <TresCylinderGeometry :args="[PLATE_RADIUS, PLATE_RADIUS, 0.2, 64]" />
      <TresMeshStandardMaterial color="#999999" :metalness="0.4" :roughness="0.4" />
    </TresMesh>
  </TresGroup>

  <!-- Bowls — own their visual and sensor, synced to plate rotation via physics body -->
  <Bowl
    v-for="(bowl, i) in BOWLS"
    :key="i"
    :local-angle="bowl.angle"
    :points="bowl.points"
    :color="bowl.color"
    :get-plate-angle="getPlateAngle"
    @score="(ballEid, pts) => onBowlScore(ballEid, pts)"
  />

  <!-- Active balls -->
  <Ball
    v-for="ball in balls"
    :key="ball.id"
    :id="ball.id"
    :spawn-x="ball.spawnX"
    :spawn-z="ball.spawnZ"
    @destroyed="(id) => onBallDestroyed(id)"
  />
</template>
