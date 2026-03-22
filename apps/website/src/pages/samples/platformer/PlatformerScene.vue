<script setup lang="ts">
import { reactive } from "vue";
import {
  useGameObject,
  useRigidBody,
  useCollider,
  useCollisionHandler,
  useInput,
  useActionMap,
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

const player = useGameObject({ position: SPAWN });
const { rigidBody: playerBodyRef } = useRigidBody({ eid: player.eid, type: "dynamic" });
useCollider({
  eid: player.eid,
  shape: "capsule",
  halfHeight: CAPSULE_HALF_HEIGHT,
  radius: CAPSULE_RADIUS,
  friction: 0.2,
  restitution: 0,
});

const rb = playerBodyRef.value;
if (rb !== null) {
  rb.lockRotations(true, true);
  rb.setEnabledTranslations(true, true, false, true);
}

let groundContacts = 0;

useCollisionHandler({
  eid: player.eid,
  handler: ({ type, isSensor }) => {
    if (isSensor === true) return;
    if (type === "started") groundContacts++;
    if (type === "stopped") groundContacts = Math.max(0, groundContacts - 1);
  },
});

function resetPlayer(): void {
  const body = playerBodyRef.value;
  if (body === null) return;
  body.setTranslation({ x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] }, true);
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  groundContacts = 0;
}

function onCoinCollected(id: number): void {
  coins[id].collected = true;
  emit("update:score", coins.filter((c) => c.collected === true).length);
}

const input = useInput({
  source: "keyboard",
  bindings: {
    dpadLeft: ["KeyA", "ArrowLeft"],
    dpadRight: ["KeyD", "ArrowRight"],
    south: ["Space"],
  },
});

const ACTIONS = {
  move: "leftStick",
  jump: ["south"],
} as const satisfies ActionMapDefinition<Actions>;

const p1 = useActionMap(input, ACTIONS);

useSystem({
  fn: () => {
    const body = playerBodyRef.value;
    if (body === null) return;
    const { x } = p1.axis("move");
    const vel = body.linvel();
    body.setLinvel({ x: x * MOVE_SPEED, y: vel.y, z: 0 }, true);
    if (p1.wasJustPressed("jump") === true && groundContacts > 0) {
      body.setLinvel({ x: vel.x, y: JUMP_SPEED, z: 0 }, true);
    }
  },
});
</script>

<template>
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
        onCoinCollected(coin.id);
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
</template>
