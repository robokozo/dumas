<script setup lang="ts">
import {
  GameObject,
  useGameObject,
  useRigidBody,
  useCollider,
  useCharacterController,
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
const JUMP_SPEED = 8;
const CAPSULE_RADIUS = 0.4;
const CAPSULE_HALF_HEIGHT = 0.4;

const player = useGameObject({ position: [0, 2, 0] });
const controller = useCharacterController({
  eid: player.eid,
  collider: { shape: "capsule", halfHeight: CAPSULE_HALF_HEIGHT, radius: CAPSULE_RADIUS },
  moveSpeed: MOVE_SPEED,
  mode: "3d",
});

useSystem({
  fn: ({ delta }) => {
    const { x, y: forward } = p1.axis("move");
    // leftStick y positive = forward = negative Z in world space
    controller.move({ x, z: -forward, delta });
    if (p1.wasJustPressed("jump") === true) {
      controller.jump({ speed: JUMP_SPEED });
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
