<script setup lang="ts">
import { inject } from "vue";
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";

const props = defineProps<{
  localAngle: number;
  points: number;
  getPlateAngle: () => number;
}>();

const emit = defineEmits<{ score: [ballEid: number, points: number] }>();

const BOWL_RADIUS_ON_PLATE = 2.4;
const PLATE_HALF_HEIGHT = 0.1;
const BALL_RADIUS = 0.15;
const BOWL_SENSOR_Y = PLATE_HALF_HEIGHT + BALL_RADIUS;
// Sensor smaller than the cup interior so only balls inside trigger it
const BOWL_SENSOR_RADIUS = 0.3;

// Cup wall geometry — approximated with WALL_COUNT box colliders around the ring
const CUP_RADIUS = 0.46;
const CUP_HEIGHT = 0.5;
const WALL_COUNT = 8;
const WALL_HALF_THICKNESS = 0.03;
const WALL_HALF_HEIGHT = CUP_HEIGHT / 2;
// Arc-length half-width per segment with small overlap to close gaps
const WALL_HALF_ARC_WIDTH = (Math.PI * CUP_RADIUS) / WALL_COUNT + 0.02;

const ballEids = inject<Set<number>>("ballEids")!;

const initialX = Math.cos(props.localAngle) * BOWL_RADIUS_ON_PLATE;
const initialZ = Math.sin(props.localAngle) * BOWL_RADIUS_ON_PLATE;

// Scoring sensor
const { eid } = useGameObject({
  position: { x: initialX, y: BOWL_SENSOR_Y, z: initialZ },
});
const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });
useCollider({
  eid,
  shape: "sphere",
  radius: BOWL_SENSOR_RADIUS,
  isSensor: true,
  onCollision: (event) => {
    if (event.type !== "started") return;
    const otherEid = event.eidA === eid ? event.eidB : event.eidA;
    if (!ballEids.has(otherEid)) return;
    emit("score", otherEid, props.points);
  },
});

// Cup wall segments — 8 box colliders arranged in a ring
type WallEntry = { rigidBody: ReturnType<typeof useRigidBody>["rigidBody"]; segLocalAngle: number };
const wallEntries: Array<WallEntry> = [];

for (let segIndex = 0; segIndex < WALL_COUNT; segIndex++) {
  const segLocalAngle = (segIndex / WALL_COUNT) * Math.PI * 2;
  const segInitX = initialX + Math.cos(segLocalAngle) * CUP_RADIUS;
  const segInitZ = initialZ + Math.sin(segLocalAngle) * CUP_RADIUS;
  const { eid: wallEid } = useGameObject({
    position: { x: segInitX, y: PLATE_HALF_HEIGHT + WALL_HALF_HEIGHT, z: segInitZ },
  });
  const { rigidBody: wallBody } = useRigidBody({ eid: wallEid, type: "kinematicPosition" });
  useCollider({
    eid: wallEid,
    shape: "box",
    args: [WALL_HALF_THICKNESS, WALL_HALF_HEIGHT, WALL_HALF_ARC_WIDTH],
  });
  wallEntries.push({ rigidBody: wallBody, segLocalAngle });
}

useSystem({
  fn: () => {
    const worldAngle = props.localAngle + props.getPlateAngle();
    const cupWorldX = Math.cos(worldAngle) * BOWL_RADIUS_ON_PLATE;
    const cupWorldZ = Math.sin(worldAngle) * BOWL_RADIUS_ON_PLATE;

    const sensorBody = rigidBody.value;
    if (sensorBody !== null) {
      sensorBody.setNextKinematicTranslation({ x: cupWorldX, y: BOWL_SENSOR_Y, z: cupWorldZ });
    }

    for (const { rigidBody: wallBody, segLocalAngle } of wallEntries) {
      const wb = wallBody.value;
      if (wb === null) continue;
      const segWorldAngle = worldAngle + segLocalAngle;
      wb.setNextKinematicTranslation({
        x: cupWorldX + Math.cos(segWorldAngle) * CUP_RADIUS,
        y: PLATE_HALF_HEIGHT + WALL_HALF_HEIGHT,
        z: cupWorldZ + Math.sin(segWorldAngle) * CUP_RADIUS,
      });
      // Rotate box so its long face is tangent to the ring
      const halfRotY = (segWorldAngle + Math.PI / 2) / 2;
      wb.setNextKinematicRotation({ x: 0, y: Math.sin(halfRotY), z: 0, w: Math.cos(halfRotY) });
    }
  },
});
</script>

<template />
