<script setup lang="ts">
import { useGameObject, useRigidBody, useCollider, useJoint } from "@dumas/core";

const anchor = useGameObject({ position: [0, 5, 0] });
const anchorBody = useRigidBody({ eid: anchor.eid, type: "fixed" });
useCollider({ eid: anchor.eid, shape: "sphere", radius: 0.1, isSensor: true });

const ball = useGameObject({ position: [2, 3, 0] });
const ballBody = useRigidBody({ eid: ball.eid, type: "dynamic" });
useCollider({ eid: ball.eid, shape: "sphere", radius: 0.4 });

// Both bodies are initialized synchronously — create joint immediately
const a = anchorBody.rigidBody.value;
const b = ballBody.rigidBody.value;
if (a !== null && b !== null) {
  useJoint({
    bodyA: a,
    bodyB: b,
    type: "spherical",
    anchorA: { x: 0, y: 0, z: 0 },
    anchorB: { x: -2, y: 2, z: 0 },
  });
}
</script>

<template>
  <!-- Anchor point marker -->
  <TresGroup
    :ref="
      (el: any) => {
        anchor.groupRef.value = el;
      }
    "
  >
    <TresMesh>
      <TresSphereGeometry :args="[0.12, 16, 16]" />
      <TresMeshStandardMaterial color="#888" />
    </TresMesh>
  </TresGroup>

  <!-- Swinging ball -->
  <TresGroup
    :ref="
      (el: any) => {
        ball.groupRef.value = el;
      }
    "
  >
    <TresMesh>
      <TresSphereGeometry :args="[0.4, 32, 32]" />
      <TresMeshStandardMaterial color="#4af" />
    </TresMesh>
  </TresGroup>
</template>
