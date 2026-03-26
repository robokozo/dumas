<script setup lang="ts">
import { inject } from "vue";
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";

const props = defineProps<{
  localAngle: number;
  points: number;
  color: string;
  getPlateAngle: () => number;
}>();

const emit = defineEmits<{ score: [ballEid: number, points: number] }>();

const BOWL_RADIUS_ON_PLATE = 2.4;
const PLATE_HALF_HEIGHT = 0.1;
const CUP_HEIGHT = 0.9;
// Distance from cup center to the inner face of each wall
const CUP_APOTHEM = 0.42;
const WALL_THICKNESS = 0.07;
// Arc length of one octagon side + small overlap to close gaps
const WALL_DEPTH = 2 * CUP_APOTHEM * Math.tan(Math.PI / 8) + 0.02;
const WALL_ANGLES = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
// Body sits at the cup's vertical center so the TresGroup origin aligns with it
const BODY_Y = PLATE_HALF_HEIGHT + CUP_HEIGHT / 2;
// Sensor radius sized so only balls that have fallen inside the cup trigger it
const SENSOR_RADIUS = 0.25;

const ballEids = inject<Set<number>>("ballEids")!;

const initialX = Math.cos(props.localAngle) * BOWL_RADIUS_ON_PLATE;
const initialZ = Math.sin(props.localAngle) * BOWL_RADIUS_ON_PLATE;

// Single entity — body drives both the sensor and the visual TresGroup via renderSyncSystem
const { eid, groupRef } = useGameObject({ position: { x: initialX, y: BODY_Y, z: initialZ } });
const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });
useCollider({
  eid,
  shape: "sphere",
  radius: SENSOR_RADIUS,
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
    const plateAngle = props.getPlateAngle();
    const worldAngle = props.localAngle + plateAngle;
    body.setNextKinematicTranslation({
      x: Math.cos(worldAngle) * BOWL_RADIUS_ON_PLATE,
      y: BODY_Y,
      z: Math.sin(worldAngle) * BOWL_RADIUS_ON_PLATE,
    });
    // Rotate the body by the plate angle so the TresGroup rotates with the plate
    const halfPlateAngle = plateAngle / 2;
    body.setNextKinematicRotation({
      x: 0,
      y: Math.sin(halfPlateAngle),
      z: 0,
      w: Math.cos(halfPlateAngle),
    });
  },
});

function setGroupRef(el: object | null): void {
  groupRef.value = el as (typeof groupRef)["value"];
}
</script>

<template>
  <!-- renderSyncSystem keeps this group synced to the body's world position + rotation -->
  <TresGroup
    :ref="
      (el: any) => {
        setGroupRef(el);
      }
    "
  >
    <!-- Base — offset down to sit on the plate surface -->
    <TresMesh :position="[0, -CUP_HEIGHT / 2, 0]">
      <TresCylinderGeometry :args="[CUP_APOTHEM, CUP_APOTHEM, 0.02, 8]" />
      <TresMeshStandardMaterial
        :color="color"
        :emissive="color"
        :emissive-intensity="0.6"
        :roughness="0.3"
      />
    </TresMesh>
    <!-- 8 octagonal wall panels -->
    <TresMesh
      v-for="(segAngle, i) in WALL_ANGLES"
      :key="i"
      :position="[Math.cos(segAngle) * CUP_APOTHEM, 0, Math.sin(segAngle) * CUP_APOTHEM]"
      :rotation="[0, -segAngle, 0]"
    >
      <TresBoxGeometry :args="[WALL_THICKNESS, CUP_HEIGHT, WALL_DEPTH]" />
      <TresMeshStandardMaterial
        :color="color"
        :emissive="color"
        :emissive-intensity="0.3"
        :roughness="0.4"
      />
    </TresMesh>
  </TresGroup>
</template>
