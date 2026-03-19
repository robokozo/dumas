<script setup lang="ts">
import { shallowRef } from "vue";
import type { Object3D } from "three";
import { DoubleSide, Quaternion, Vector3 } from "three";
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
import ColorBall from "./ColorBall.vue";

const HEX_RADIUS = 3;
const HEX_HEIGHT = 6;
const WALL_THICKNESS = 0.15;
const SPIN_SPEED = 0.5;
const NUM_SIDES = 6;
const APOTHEM = HEX_RADIUS * Math.cos(Math.PI / NUM_SIDES);

// Tilt 90° around the Z axis so the hex lies on its side like a tumbler
const TILT_ANGLE = Math.PI / 2;
const HEX_CENTER = new Vector3(0, HEX_RADIUS + 0.5, 0);

// Pre-allocate reusable math objects to avoid per-frame GC
const tiltQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), TILT_ANGLE);
const tempSpinQuat = new Quaternion();
const tempCombinedQuat = new Quaternion();
const tempWallQuat = new Quaternion();
const tempPos = new Vector3();
const yAxis = new Vector3(0, 1, 0);

// -- Hex container walls (physics-only, no visual mesh) --

interface WallRef {
  rigidBody: ReturnType<typeof useRigidBody>["rigidBody"];
  baseAngle: number;
}

const walls: Array<WallRef> = [];

for (let i = 0; i < NUM_SIDES; i++) {
  const angle = (i * 2 * Math.PI) / NUM_SIDES + Math.PI / NUM_SIDES;

  // Compute initial tilted position so walls are correct on the first frame
  tempPos.set(APOTHEM * Math.sin(angle), 0, APOTHEM * Math.cos(angle));
  tempPos.applyQuaternion(tiltQuat);
  tempPos.add(HEX_CENTER);

  tempWallQuat.setFromAxisAngle(yAxis, angle);
  tempWallQuat.premultiply(tiltQuat);

  const { eid } = useGameObject({
    position: [tempPos.x, tempPos.y, tempPos.z],
    rotation: [tempWallQuat.x, tempWallQuat.y, tempWallQuat.z, tempWallQuat.w],
  });
  const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });
  useCollider({
    eid,
    shape: "box",
    args: [HEX_RADIUS / 2, HEX_HEIGHT / 2, WALL_THICKNESS / 2],
    restitution: 0.5,
    friction: 0.3,
  });

  walls.push({ rigidBody, baseAngle: angle });
}

// -- End caps (top and bottom, keep balls inside the tilted hex) --

interface CapRef {
  rigidBody: ReturnType<typeof useRigidBody>["rigidBody"];
  localY: number;
}

const caps: Array<CapRef> = [];

for (const localY of [-HEX_HEIGHT / 2, HEX_HEIGHT / 2]) {
  // Compute initial tilted position for end caps
  tempPos.set(0, localY, 0);
  tempPos.applyQuaternion(tiltQuat);
  tempPos.add(HEX_CENTER);

  const { eid } = useGameObject({
    position: [tempPos.x, tempPos.y, tempPos.z],
    rotation: [tiltQuat.x, tiltQuat.y, tiltQuat.z, tiltQuat.w],
  });
  const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });
  useCollider({
    eid,
    shape: "box",
    args: [HEX_RADIUS, 0.05, HEX_RADIUS],
    restitution: 0.3,
    friction: 0.6,
  });
  caps.push({ rigidBody, localY });
}

// -- Visual hex container mesh --

const hexVisualRef = shallowRef<Object3D | null>(null);

// -- Spin system --

let spinAngle = 0;

useSystem({
  fn: ({ delta }) => {
    spinAngle += SPIN_SPEED * delta;

    // Compose tilt * spin quaternion
    tempSpinQuat.setFromAxisAngle(yAxis, spinAngle);
    tempCombinedQuat.copy(tiltQuat).multiply(tempSpinQuat);

    // Rotate physics walls
    for (const wall of walls) {
      const rb = wall.rigidBody.value;
      if (rb === null) {
        continue;
      }

      const angle = wall.baseAngle + spinAngle;

      // Wall position in local hex space (centered at origin)
      tempPos.set(APOTHEM * Math.sin(angle), 0, APOTHEM * Math.cos(angle));
      // Apply tilt, then translate to world
      tempPos.applyQuaternion(tiltQuat);
      tempPos.add(HEX_CENTER);

      // Wall rotation: tilt * wallYRotation
      tempWallQuat.setFromAxisAngle(yAxis, angle);
      tempWallQuat.premultiply(tiltQuat);

      rb.setNextKinematicTranslation({ x: tempPos.x, y: tempPos.y, z: tempPos.z });
      rb.setNextKinematicRotation({
        x: tempWallQuat.x,
        y: tempWallQuat.y,
        z: tempWallQuat.z,
        w: tempWallQuat.w,
      });
    }

    // Rotate end caps
    for (const cap of caps) {
      const rb = cap.rigidBody.value;
      if (rb === null) {
        continue;
      }

      tempPos.set(0, cap.localY, 0);
      tempPos.applyQuaternion(tiltQuat);
      tempPos.add(HEX_CENTER);

      rb.setNextKinematicTranslation({ x: tempPos.x, y: tempPos.y, z: tempPos.z });
      rb.setNextKinematicRotation({
        x: tempCombinedQuat.x,
        y: tempCombinedQuat.y,
        z: tempCombinedQuat.z,
        w: tempCombinedQuat.w,
      });
    }

    // Rotate visual mesh
    if (hexVisualRef.value !== null) {
      hexVisualRef.value.quaternion.copy(tempCombinedQuat);
    }
  },
});

// -- Ball starting positions (inside the hex) --

// Balls spawn inside the tumbler — cylinder axis is horizontal (X) after 90° Z tilt
// Cross-section centered at y = HEX_CENTER.y, balls spread along X and near center Y/Z
const CY = HEX_CENTER.y;
const ballPositions: Array<{ id: number; pos: [number, number, number] }> = [
  { id: 0, pos: [-1.5, CY, 0] },
  { id: 1, pos: [-0.5, CY, 0.3] },
  { id: 2, pos: [0.5, CY, -0.3] },
  { id: 3, pos: [1.5, CY, 0.2] },
  { id: 4, pos: [-1, CY + 0.5, -0.2] },
  { id: 5, pos: [0, CY + 0.3, 0.4] },
  { id: 6, pos: [1, CY - 0.3, -0.4] },
  { id: 7, pos: [-0.3, CY + 0.2, 0.1] },
];
</script>

<template>
  <TresPerspectiveCamera :position="[0, 8, 14]" :look-at="[0, 4, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.6" />
  <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.2" />
  <TresDirectionalLight :position="[-3, 8, -4]" :intensity="0.4" />

  <!-- Transparent hex container visual -->
  <TresGroup ref="hexVisualRef" :position="[HEX_CENTER.x, HEX_CENTER.y, HEX_CENTER.z]">
    <!-- Side walls -->
    <TresMesh>
      <TresCylinderGeometry :args="[HEX_RADIUS, HEX_RADIUS, HEX_HEIGHT, 6, 1, true]" />
      <TresMeshPhysicalMaterial
        color="#4488ff"
        :opacity="0.12"
        :transparent="true"
        :side="DoubleSide"
        :metalness="0.2"
        :roughness="0.1"
      />
    </TresMesh>
    <!-- End caps -->
    <TresMesh>
      <TresCylinderGeometry :args="[HEX_RADIUS, HEX_RADIUS, HEX_HEIGHT, 6, 1, false]" />
      <TresMeshPhysicalMaterial
        color="#4488ff"
        :opacity="0.08"
        :transparent="true"
        :side="DoubleSide"
        :metalness="0.2"
        :roughness="0.1"
      />
    </TresMesh>
    <!-- Wireframe overlay -->
    <TresMesh>
      <TresCylinderGeometry :args="[HEX_RADIUS, HEX_RADIUS, HEX_HEIGHT, 6, 1, false]" />
      <TresMeshBasicMaterial color="#4488ff" :opacity="0.3" :transparent="true" :wireframe="true" />
    </TresMesh>
  </TresGroup>

  <!-- Balls -->
  <ColorBall v-for="ball in ballPositions" :key="ball.id" :position="ball.pos" />
</template>
