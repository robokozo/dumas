<script setup lang="ts">
import {
  GameObject,
  useGameObject,
  useRigidBody,
  useCollider,
  useDumasContext,
  useActions,
  useSystem,
} from "@dumas/core";
import type { ActionMapDefinition } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";

type Actions = "move" | "jump";

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
  } as const satisfies ActionMapDefinition<Actions>,
});

const ctx = useDumasContext();

// Ground
const ground = useGameObject({ position: [0, -0.5, 0] });
useRigidBody({ eid: ground.eid, type: "fixed" });
useCollider({ eid: ground.eid, shape: "box", args: [8, 0.5, 8] });

// Player
const player = useGameObject({ position: [0, 2, 0] });
const { rigidBody } = useRigidBody({ eid: player.eid, type: "dynamic" });
const { collider: playerCollider } = useCollider({
  eid: player.eid,
  shape: "capsule",
  halfHeight: CAPSULE_HALF_HEIGHT,
  radius: CAPSULE_RADIUS,
  friction: 0,
});

// Prevent capsule from tipping over under contact forces
rigidBody.value?.lockRotations(true, true);

function isGrounded(): boolean {
  const world = ctx.physicsWorld.value;
  const col = playerCollider.value;
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

useSystem({
  fn: () => {
    const body = rigidBody.value;
    if (body === null) return;

    const { x, y: forward } = p1.axis("move");
    const vel = body.linvel();
    // leftStick y positive = forward = negative Z in world space
    const newX = x * MOVE_SPEED;
    const newZ = -forward * MOVE_SPEED;

    if (p1.wasJustPressed("jump") === true && isGrounded() === true) {
      body.setLinvel({ x: newX, y: JUMP_SPEED, z: newZ }, true);
    } else {
      body.setLinvel({ x: newX, y: vel.y, z: newZ }, true);
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

    <!-- Player -->
    <TresGroup
      :ref="
        (el: any) => {
          player.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresCapsuleGeometry :args="[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]" />
        <TresMeshStandardMaterial color="#4af" :metalness="0.2" :roughness="0.5" />
      </TresMesh>
    </TresGroup>
  </GameObject>
</template>
