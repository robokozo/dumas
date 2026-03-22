<script setup lang="ts">
import { watch, onMounted } from "vue";
import {
  useGameObject,
  useCharacterController,
  useContactDetection,
  useActions,
  useSystem,
} from "@dumas/core";
import type { ActionMapDefinition } from "@dumas/core";

type Actions = "move" | "jump";

const MOVE_SPEED = 8;
const JUMP_SPEED = 12;
const CAPSULE_HALF_HEIGHT = 0.4;
const CAPSULE_RADIUS = 0.3;

const props = withDefaults(
  defineProps<{
    position: [number, number, number];
    resetTrigger?: number;
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
  ready: [eid: number];
}>();

const { eid, groupRef } = useGameObject({ position: props.position });

const { rigidBody, collider, move, teleport } = useCharacterController({
  eid,
  mode: "2d",
  moveSpeed: MOVE_SPEED,
  collider: {
    shape: "capsule",
    halfHeight: CAPSULE_HALF_HEIGHT,
    radius: CAPSULE_RADIUS,
  },
});

const { hasContact } = useContactDetection({ collider });

function reset(): void {
  teleport({ position: { x: props.position[0], y: props.position[1], z: props.position[2] } });
}

watch(
  () => props.resetTrigger,
  () => {
    reset();
  },
);

onMounted(() => {
  emit("ready", eid);
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
  } as const satisfies ActionMapDefinition<Actions>,
});

useSystem({
  fn: ({ delta }) => {
    const { x } = input.axis("move");
    move({ x, z: 0, delta });
    if (
      input.wasJustPressed("jump") === true &&
      hasContact({ direction: { x: 0, y: 1, z: 0 } }) === true
    ) {
      const body = rigidBody.value;
      if (body !== null) {
        const vel = body.linvel();
        body.setLinvel({ x: vel.x, y: JUMP_SPEED, z: vel.z }, true);
      }
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
