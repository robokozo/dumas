<script setup lang="ts">
import {
  useGameObject,
  useRigidBody,
  useCollider,
  useSystem,
  useInput,
  useActionMap,
} from "@dumas/core";
import type { ActionMapDefinition } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";

type Actions = "move" | "jump";

const ACTIONS = {
  move: "leftStick",
  jump: ["south"],
} as const satisfies ActionMapDefinition<Actions>;

const input = useInput({
  source: "keyboard",
  bindings: {
    dpadUp: ["KeyW", "ArrowUp"],
    dpadDown: ["KeyS", "ArrowDown"],
    dpadLeft: ["KeyA", "ArrowLeft"],
    dpadRight: ["KeyD", "ArrowRight"],
    south: ["Space"],
  },
});

const p1 = useActionMap(input, ACTIONS);

// Ground
const ground = useGameObject({ position: [0, -0.5, 0] });
useRigidBody({ eid: ground.eid, type: "fixed" });
useCollider({ eid: ground.eid, shape: "box", args: [8, 0.5, 8] });

// Player
const MOVE_SPEED = 6;
const JUMP_IMPULSE = 5;
const CAPSULE_RADIUS = 0.4;
const CAPSULE_HALF_HEIGHT = 0.4;
// Bottom of capsule sits at: pos.y - (halfHeight + radius)
// Grounded when bottom is near ground surface (y = 0)
const GROUNDED_THRESHOLD = CAPSULE_HALF_HEIGHT + CAPSULE_RADIUS + 0.15;

const player = useGameObject({ position: [0, 2, 0] });
const { rigidBody: playerBody } = useRigidBody({ eid: player.eid, type: "dynamic" });
useCollider({
  eid: player.eid,
  shape: "capsule",
  radius: CAPSULE_RADIUS,
  halfHeight: CAPSULE_HALF_HEIGHT,
});

useSystem({
  fn: () => {
    const rb = playerBody.value;
    if (rb === null) return;

    const { x, y: forward } = p1.axis("move");
    const vel = rb.linvel();
    const pos = rb.translation();
    const isGrounded = pos.y < GROUNDED_THRESHOLD;

    rb.setLinvel(
      {
        x: x * MOVE_SPEED,
        y: vel.y,
        // leftStick y positive = forward = negative Z in world space
        z: -forward * MOVE_SPEED,
      },
      true,
    );

    if (p1.wasJustPressed("jump") && isGrounded) {
      rb.applyImpulse({ x: 0, y: JUMP_IMPULSE, z: 0 }, true);
    }
  },
});
</script>

<template>
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
</template>
