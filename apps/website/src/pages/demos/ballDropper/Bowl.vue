<script setup lang="ts">
import { inject } from "vue";
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";

const props = defineProps<{
  localAngle: number;
  points: number;
  getPlateAngle: () => number;
}>();

const emit = defineEmits<{ score: [ballEid: number, points: number] }>();

const BOWL_RADIUS_ON_PLATE = 1.8;
const PLATE_HALF_HEIGHT = 0.1;
const BALL_RADIUS = 0.15;
// Center at the height where balls roll on the plate surface
const BOWL_SENSOR_Y = PLATE_HALF_HEIGHT + BALL_RADIUS;
const BOWL_SENSOR_RADIUS = 0.4;

const ballEids = inject<Set<number>>("ballEids")!;

const initialX = Math.cos(props.localAngle) * BOWL_RADIUS_ON_PLATE;
const initialZ = Math.sin(props.localAngle) * BOWL_RADIUS_ON_PLATE;

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

useSystem({
  fn: () => {
    const body = rigidBody.value;
    if (body === null) return;
    const worldAngle = props.localAngle + props.getPlateAngle();
    body.setNextKinematicTranslation({
      x: Math.cos(worldAngle) * BOWL_RADIUS_ON_PLATE,
      y: BOWL_SENSOR_Y,
      z: Math.sin(worldAngle) * BOWL_RADIUS_ON_PLATE,
    });
  },
});
</script>

<template />
