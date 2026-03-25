<script setup lang="ts">
import type { ShallowRef } from "vue";
import type { Collider } from "@dimforge/rapier3d-compat";
import {
  GameObject,
  useGameObject,
  useRigidBody,
  useCollider,
  useDumasContext,
  useActions,
  useSystem,
} from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";

const MOVE_SPEED = 6;
const JUMP_SPEED = 8;
const CAPSULE_RADIUS = 0.4;
const CAPSULE_HALF_HEIGHT = 0.4;
const GROUND_NORMAL_Y_MIN = 0.5;

const p1 = useActions({
  source: "keyboard",
  bindings: {
    dpadUp: ["KeyW", "ArrowUp"],
    dpadDown: ["KeyS", "ArrowDown"],
    dpadLeft: ["KeyA", "ArrowLeft"],
    dpadRight: ["KeyD", "ArrowRight"],
    south: ["Space"],
  },
  actions: {
    move: "leftStick",
    jump: ["south"],
  },
});

const p2 = useActions({
  source: { type: "gamepad", index: 0 },
  actions: {
    move: "leftStick",
    jump: ["south"],
  },
});

const ctx = useDumasContext();

// Ground
const ground = useGameObject({ position: { x: 0, y: -0.5, z: 0 } });
useRigidBody({ eid: ground.eid, type: "fixed" });
useCollider({ eid: ground.eid, shape: "box", args: [8, 0.5, 8] });

function isGrounded({ collider }: { collider: ShallowRef<Collider | null> }): boolean {
  const world = ctx.physicsWorld.value;
  const col = collider.value;
  if (world === null || col === null) return false;

  let grounded = false;
  world.contactPairsWith(col, (otherCollider) => {
    if (grounded === true) return;
    world.contactPair(col, otherCollider, (manifold) => {
      const n = manifold.normal();
      if (Math.abs(n.y) > GROUND_NORMAL_Y_MIN) {
        grounded = true;
      }
    });
  });
  return grounded;
}

// Player 1 (keyboard)
const player1 = useGameObject({ position: { x: -2, y: 2, z: 0 } });
const { rigidBody: body1 } = useRigidBody({ eid: player1.eid, type: "dynamic" });
const { collider: collider1 } = useCollider({
  eid: player1.eid,
  shape: "capsule",
  halfHeight: CAPSULE_HALF_HEIGHT,
  radius: CAPSULE_RADIUS,
  friction: 0,
});
body1.value?.lockRotations(true, true);

// Player 2 (gamepad)
const player2 = useGameObject({ position: { x: 2, y: 2, z: 0 } });
const { rigidBody: body2 } = useRigidBody({ eid: player2.eid, type: "dynamic" });
const { collider: collider2 } = useCollider({
  eid: player2.eid,
  shape: "capsule",
  halfHeight: CAPSULE_HALF_HEIGHT,
  radius: CAPSULE_RADIUS,
  friction: 0,
});
body2.value?.lockRotations(true, true);

useSystem({
  fn: () => {
    const b1 = body1.value;
    if (b1 !== null) {
      const { x, y: forward } = p1.axis("move");
      const vel = b1.linvel();
      const newX = x * MOVE_SPEED;
      const newZ = -forward * MOVE_SPEED;
      if (p1.wasJustPressed("jump") === true && isGrounded({ collider: collider1 }) === true) {
        b1.setLinvel({ x: newX, y: JUMP_SPEED, z: newZ }, true);
      } else {
        b1.setLinvel({ x: newX, y: vel.y, z: newZ }, true);
      }
    }

    const b2 = body2.value;
    if (b2 !== null) {
      const { x, y: forward } = p2.axis("move");
      const vel = b2.linvel();
      const newX = x * MOVE_SPEED;
      const newZ = -forward * MOVE_SPEED;
      if (p2.wasJustPressed("jump") === true && isGrounded({ collider: collider2 }) === true) {
        b2.setLinvel({ x: newX, y: JUMP_SPEED, z: newZ }, true);
      } else {
        b2.setLinvel({ x: newX, y: vel.y, z: newZ }, true);
      }
    }
  },
});
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 8, 14]" :look-at="[0, 0, 0]" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 10, 5]" :intensity="1" cast-shadow />

    <!-- Ground -->
    <TresGroup
      :ref="
        (el: any) => {
          ground.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresBoxGeometry :args="[16, 1, 16]" />
        <TresMeshStandardMaterial color="#555" />
      </TresMesh>
    </TresGroup>

    <!-- Player 1 (keyboard) -->
    <TresGroup
      :ref="
        (el: any) => {
          player1.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresCapsuleGeometry :args="[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]" />
        <TresMeshStandardMaterial color="#4af" :metalness="0.2" :roughness="0.5" />
      </TresMesh>
    </TresGroup>

    <!-- Player 2 (gamepad) -->
    <TresGroup
      :ref="
        (el: any) => {
          player2.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresCapsuleGeometry :args="[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]" />
        <TresMeshStandardMaterial color="#fa4" :metalness="0.2" :roughness="0.5" />
      </TresMesh>
    </TresGroup>
  </GameObject>
</template>
