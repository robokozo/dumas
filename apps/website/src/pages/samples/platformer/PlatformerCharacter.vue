<script setup lang="ts">
import { onMounted } from "vue";
import {
  useGameObject,
  useCharacterController,
  useCollisionHandler,
  useActions,
  useSystem,
} from "@dumas/core";
import type { ActionMapDefinition } from "@dumas/core";

type Actions = "move" | "jump";

const MOVE_SPEED = 8;
const JUMP_SPEED = 16;
const CAPSULE_HALF_HEIGHT = 0.4;
const CAPSULE_RADIUS = 0.3;

const props = withDefaults(
  defineProps<{
    position: [number, number, number];
    color?: string;
    leftKeys?: Array<string>;
    rightKeys?: Array<string>;
    jumpKeys?: Array<string>;
  }>(),
  {
    color: "#4af",
    leftKeys: () => ["KeyA"],
    rightKeys: () => ["KeyD"],
    jumpKeys: () => ["Space"],
  },
);

const emit = defineEmits<{
  ready: [info: { eid: number; resetPlayer: () => void }];
  collision: [otherEid: number];
}>();

const { eid, groupRef } = useGameObject({ position: props.position });

const { move, jump, isGrounded, teleport } = useCharacterController({
  eid,
  mode: "2d",
  moveSpeed: MOVE_SPEED,
  jumpSpeed: JUMP_SPEED,
  collider: {
    shape: "capsule",
    halfHeight: CAPSULE_HALF_HEIGHT,
    radius: CAPSULE_RADIUS,
  },
});

useCollisionHandler({
  eid,
  handler: ({ eidA, eidB, type }) => {
    if (type !== "started") return;
    const otherEid = eidA === eid ? eidB : eidA;
    emit("collision", otherEid);
  },
});

function reset(): void {
  teleport({ position: { x: props.position[0], y: props.position[1], z: props.position[2] } });
}

onMounted(() => {
  emit("ready", { eid, resetPlayer: reset });
});

const input = useActions({
  source: "keyboard",
  bindings: {
    dpadLeft: props.leftKeys,
    dpadRight: props.rightKeys,
    south: props.jumpKeys,
  },
  actions: {
    move: "leftStick",
    jump: ["south"],
  },
});

useSystem({
  fn: ({ delta }) => {
    const { x } = input.axis("move");
    move({ x, z: 0, delta });
    if (input.wasJustPressed("jump") === true && isGrounded.value === true) {
      jump();
    }
  },
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresCapsuleGeometry :args="[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]" />
      <TresMeshStandardMaterial :color="color" />
    </TresMesh>
  </TresGroup>
</template>
