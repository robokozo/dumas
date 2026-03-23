<script setup lang="ts">
import { shallowRef, reactive, computed } from "vue";
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

const reset1Player = shallowRef<(() => void) | null>(null);
const reset2Player = shallowRef<(() => void) | null>(null);
const score1 = shallowRef(0);
const score2 = shallowRef(0);
const coins = reactive(COIN_DATA.map((c) => ({ ...c, collected: false })));

const lavaEid = shallowRef<number | null>(null);

const coinEidToId = new Map<number, number>();

const isReady = computed(() => reset1Player.value !== null && reset2Player.value !== null);

function onCoinReady({ id, eid }: { id: number; eid: number }): void {
  coinEidToId.set(eid, id);
}

function onCollision({ otherEid, playerIndex }: { otherEid: number; playerIndex: 1 | 2 }): void {
  if (lavaEid.value !== null && otherEid === lavaEid.value) {
    const resetPlayer = playerIndex === 1 ? reset1Player.value : reset2Player.value;
    if (resetPlayer !== null) {
      resetPlayer();
    }
    return;
  }
  const coinId = coinEidToId.get(otherEid);
  if (coinId === undefined) return;
  coins[coinId].collected = true;
  if (playerIndex === 1) {
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
      :left-keys="['KeyA']"
      :right-keys="['KeyD']"
      :jump-keys="['KeyW']"
      @ready="
        (info) => {
          reset1Player = info.resetPlayer;
        }
      "
      @collision="
        (otherEid) => {
          onCollision({ otherEid, playerIndex: 1 });
        }
      "
    />

    <PlatformerCharacter
      :position="SPAWN_P2"
      color="#f44"
      :left-keys="['ArrowLeft']"
      :right-keys="['ArrowRight']"
      :jump-keys="['ArrowUp']"
      @ready="
        (info) => {
          reset2Player = info.resetPlayer;
        }
      "
      @collision="
        (otherEid) => {
          onCollision({ otherEid, playerIndex: 2 });
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
        @ready="
          (eid) => {
            onCoinReady({ id: coin.id, eid });
          }
        "
      />

      <PlatformerLava
        @ready="
          (eid) => {
            lavaEid = eid;
          }
        "
      />
    </template>
  </GameObject>
</template>
