<script setup lang="ts">
import { reactive } from "vue";
import {
  GameObject,
  useGameObject,
  useRigidBody,
  useCollider,
  useCharacterController,
  useActions,
  useSystem,
} from "@dumas/core";
import type { ActionMapDefinition } from "@dumas/core";
import PlatformerPlatform from "./PlatformerPlatform.vue";
import PlatformerCoin from "./PlatformerCoin.vue";
import PlatformerLava from "./PlatformerLava.vue";

type Actions = "move" | "jump";

const SPAWN: [number, number, number] = [0, 3, 0];
const MOVE_SPEED = 8;
const JUMP_SPEED = 12;
const CAPSULE_HALF_HEIGHT = 0.4;
const CAPSULE_RADIUS = 0.3;
const WALL_POSITION: [number, number, number] = [3, 1.5, 0];
const WALL_HALF_W = 0.25;
const WALL_HALF_H = 1.5;
const WALL_HALF_D = 1;

const PLATFORMS: Array<{ position: [number, number, number]; width: number }> = [
  { position: [0, 0, 0], width: 20 },
  { position: [-6, 3, 0], width: 4 },
  { position: [6, 3, 0], width: 4 },
  { position: [0, 6, 0], width: 4 },
  { position: [-4, 9, 0], width: 3.5 },
  { position: [4, 9, 0], width: 3.5 },
];

const COIN_DATA: Array<{ id: number; position: [number, number, number] }> = [
  { id: 0, position: [-6, 4.5, 0] },
  { id: 1, position: [6, 4.5, 0] },
  { id: 2, position: [0, 7.5, 0] },
  { id: 3, position: [-4, 10.5, 0] },
  { id: 4, position: [4, 10.5, 0] },
];

const emit = defineEmits<{
  "update:score": [score: number];
}>();

const coins = reactive(COIN_DATA.map((c) => ({ ...c, collected: false })));

const wall = useGameObject({ position: WALL_POSITION });
useRigidBody({ eid: wall.eid, type: "fixed" });
useCollider({
  eid: wall.eid,
  shape: "box",
  args: [WALL_HALF_W, WALL_HALF_H, WALL_HALF_D],
  friction: 0,
  restitution: 0,
});

const player = useGameObject({ position: SPAWN });
const { move, jump, teleport } = useCharacterController({
  eid: player.eid,
  mode: "2d",
  moveSpeed: MOVE_SPEED,
  collider: {
    shape: "capsule",
    halfHeight: CAPSULE_HALF_HEIGHT,
    radius: CAPSULE_RADIUS,
  },
});

function resetPlayer(): void {
  teleport({ position: { x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] } });
}

function onCoinCollected({ id }: { id: number }): void {
  coins[id].collected = true;
  emit("update:score", coins.filter((c) => c.collected === true).length);
}

const p1 = useActions({
  source: "keyboard",
  bindings: {
    dpadLeft: ["KeyA", "ArrowLeft"],
    dpadRight: ["KeyD", "ArrowRight"],
    south: ["Space"],
  },
  actions: {
    move: "leftStick",
    jump: ["south"],
  } as const satisfies ActionMapDefinition<Actions>,
});

useSystem({
  fn: ({ delta }) => {
    const { x } = p1.axis("move");
    move({ x, z: 0, delta });
    if (p1.wasJustPressed("jump") === true) {
      jump({ speed: JUMP_SPEED });
    }
  },
});
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 5, 22]" :look-at="[0, 5, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[8, 15, 10]" :intensity="1.2" cast-shadow />

    <TresGroup
      :ref="
        (el: any) => {
          player.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresCapsuleGeometry :args="[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]" />
        <TresMeshStandardMaterial color="#4af" />
      </TresMesh>
    </TresGroup>

    <TresGroup
      :ref="
        (el: any) => {
          wall.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresBoxGeometry :args="[WALL_HALF_W * 2, WALL_HALF_H * 2, WALL_HALF_D * 2]" />
        <TresMeshStandardMaterial color="#888" />
      </TresMesh>
    </TresGroup>

    <PlatformerPlatform
      v-for="(platform, i) in PLATFORMS"
      :key="i"
      :position="platform.position"
      :width="platform.width"
    />

    <PlatformerCoin
      v-for="coin in coins.filter((c) => c.collected === false)"
      :key="coin.id"
      :position="coin.position"
      :player-eid="player.eid"
      @collect="
        () => {
          onCoinCollected({ id: coin.id });
        }
      "
    />

    <PlatformerLava
      :player-eid="player.eid"
      @die="
        () => {
          resetPlayer();
        }
      "
    />
  </GameObject>
</template>
