<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { GameObject } from "@dumas/core";
import PlatformerCharacter from "./PlatformerCharacter.vue";
import PlatformerWall from "./PlatformerWall.vue";
import PlatformerPlatform from "./PlatformerPlatform.vue";
import PlatformerCoin from "./PlatformerCoin.vue";
import PlatformerLava from "./PlatformerLava.vue";

const SPAWN_P1: [number, number, number] = [0, 3, 0];
const SPAWN_P2: [number, number, number] = [3, 3, 0];

const WALLS: Array<{ position: [number, number, number] }> = [
  { position: [-10, 1.5, 0] },
  { position: [10, 1.5, 0] },
];

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
  "update:score1": [score: number];
  "update:score2": [score: number];
}>();

const player1Eid = ref<number | null>(null);
const player2Eid = ref<number | null>(null);
const reset1Trigger = ref(0);
const reset2Trigger = ref(0);
const score1 = ref(0);
const score2 = ref(0);
const coins = reactive(COIN_DATA.map((c) => ({ ...c, collected: false })));

const playerEids = computed(() => {
  const eids: Array<number> = [];
  if (player1Eid.value !== null) eids.push(player1Eid.value);
  if (player2Eid.value !== null) eids.push(player2Eid.value);
  return eids;
});

const isReady = computed(() => player1Eid.value !== null && player2Eid.value !== null);

function onDie({ eid }: { eid: number }): void {
  if (eid === player1Eid.value) {
    reset1Trigger.value += 1;
  } else if (eid === player2Eid.value) {
    reset2Trigger.value += 1;
  }
}

function onCoinCollected({ id, collectorEid }: { id: number; collectorEid: number }): void {
  coins[id].collected = true;
  if (collectorEid === player1Eid.value) {
    score1.value += 1;
    emit("update:score1", score1.value);
  } else {
    score2.value += 1;
    emit("update:score2", score2.value);
  }
}
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 5, 22]" :look-at="[0, 5, 0]" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[8, 15, 10]" :intensity="1.2" cast-shadow />

    <PlatformerCharacter
      :position="SPAWN_P1"
      :reset-trigger="reset1Trigger"
      :left-keys="['KeyA']"
      :right-keys="['KeyD']"
      :jump-keys="['KeyW']"
      @ready="
        (eid) => {
          player1Eid = eid;
        }
      "
    />

    <PlatformerCharacter
      :position="SPAWN_P2"
      :reset-trigger="reset2Trigger"
      color="#f44"
      :left-keys="['ArrowLeft']"
      :right-keys="['ArrowRight']"
      :jump-keys="['ArrowUp']"
      @ready="
        (eid) => {
          player2Eid = eid;
        }
      "
    />

    <PlatformerWall v-for="(wall, i) in WALLS" :key="i" :position="wall.position" />

    <PlatformerPlatform
      v-for="(platform, i) in PLATFORMS"
      :key="i"
      :position="platform.position"
      :width="platform.width"
    />

    <template v-if="isReady">
      <PlatformerCoin
        v-for="coin in coins.filter((c) => c.collected === false)"
        :key="coin.id"
        :position="coin.position"
        :player-eids="playerEids"
        @collect="
          (collectorEid) => {
            onCoinCollected({ id: coin.id, collectorEid });
          }
        "
      />

      <PlatformerLava
        :player-eids="playerEids"
        @die="
          (eid) => {
            onDie({ eid });
          }
        "
      />
    </template>
  </GameObject>
</template>
