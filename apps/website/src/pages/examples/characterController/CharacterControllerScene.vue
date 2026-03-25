<script setup lang="ts">
import { computed } from "vue";
import {
  GameObject,
  useGameObject,
  useRigidBody,
  useCollider,
  useCharacterController,
  useActions,
  useSystem,
} from "@dumas/core";

const CAPSULE_HALF_HEIGHT = 0.35;
const CAPSULE_RADIUS = 0.3;
const MOVE_SPEED = 6;
const JUMP_VY = 12;
const RAMP_ANGLE = Math.PI / 6;

const ground = useGameObject({ position: { x: 0, y: -0.3, z: 0 } });
useRigidBody({ eid: ground.eid, type: "fixed" });
useCollider({ eid: ground.eid, shape: "box", args: [8, 0.3, 2] });

const ramp = useGameObject({
  position: { x: -4.5, y: 0.8, z: 0 },
  rotation: { x: 0, y: 0, z: -Math.sin(RAMP_ANGLE / 2), w: Math.cos(RAMP_ANGLE / 2) },
});
useRigidBody({ eid: ramp.eid, type: "fixed" });
useCollider({ eid: ramp.eid, shape: "box", args: [2, 0.15, 2] });

const platform = useGameObject({ position: { x: 4, y: 1, z: 0 } });
useRigidBody({ eid: platform.eid, type: "fixed" });
useCollider({ eid: platform.eid, shape: "box", args: [2.5, 0.2, 2] });

const character = useGameObject({ position: { x: 0, y: 1, z: 0 } });
const { move, setVelocity, isGrounded } = useCharacterController({
  eid: character.eid,
  mode: "2d",
  moveSpeed: MOVE_SPEED,
  collider: {
    shape: "capsule",
    halfHeight: CAPSULE_HALF_HEIGHT,
    radius: CAPSULE_RADIUS,
  },
  kcc: { trackContacts: true },
});

const input = useActions({
  source: "keyboard",
  bindings: {
    dpadLeft: ["KeyA", "ArrowLeft"],
    dpadRight: ["KeyD", "ArrowRight"],
    south: ["Space", "KeyW", "ArrowUp"],
  },
  actions: {
    move: "leftStick",
    jump: ["south"],
  },
});

useSystem({
  fn: ({ delta }) => {
    const { x } = input.axis("move");
    if (input.wasJustPressed("jump") === true && isGrounded.value === true) {
      setVelocity({ y: JUMP_VY });
    }
    move({ x, z: 0, delta });
  },
});

const characterColor = computed(() => (isGrounded.value === true ? "#4af" : "#f8a"));
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 2, 24]" :look-at="[0, 1, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.2" />

    <TresGroup
      :ref="
        (el: any) => {
          ground.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresBoxGeometry :args="[16, 0.6, 4]" />
        <TresMeshStandardMaterial color="#333" />
      </TresMesh>
    </TresGroup>

    <TresGroup
      :ref="
        (el: any) => {
          ramp.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresBoxGeometry :args="[4, 0.3, 4]" />
        <TresMeshStandardMaterial color="#444" />
      </TresMesh>
    </TresGroup>

    <TresGroup
      :ref="
        (el: any) => {
          platform.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresBoxGeometry :args="[5, 0.4, 4]" />
        <TresMeshStandardMaterial color="#444" />
      </TresMesh>
    </TresGroup>

    <TresGroup
      :ref="
        (el: any) => {
          character.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresCapsuleGeometry :args="[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]" />
        <TresMeshStandardMaterial :color="characterColor" />
      </TresMesh>
    </TresGroup>
  </GameObject>
</template>
