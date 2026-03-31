<script setup lang="ts">
import { ref, shallowRef, computed } from "vue";
import { Scene } from "@dumas/core";
import {
  ENEMY_COUNT,
  ENEMY_SPAWN_RADIUS,
  ENEMY_MAX_HEALTH,
  PLAYER_MAX_HEALTH,
  WEAPON_DAMAGE,
  PLAYER_COLOR,
  ENEMY_COLOR,
} from "./constants";
import type { EnemySpawn, GameState } from "./types";
import BrawlerPlayer from "./BrawlerPlayer.vue";
import BrawlerEnemy from "./BrawlerEnemy.vue";
import BrawlerArena from "./BrawlerArena.vue";
import BrawlerUI from "./BrawlerUI.vue";

const gameState = ref<GameState>("playing");
const playerHealth = ref(PLAYER_MAX_HEALTH);

const playerRef = shallowRef<InstanceType<typeof BrawlerPlayer> | null>(null);
const enemyRefs = shallowRef<Array<InstanceType<typeof BrawlerEnemy>>>([]);

// Generate enemy spawn positions evenly around the arena
const FULL_CIRCLE = Math.PI * 2;

function createEnemySpawns(): Array<EnemySpawn> {
  const spawns: Array<EnemySpawn> = [];
  for (let i = 0; i < ENEMY_COUNT; i++) {
    const angle = (i / ENEMY_COUNT) * FULL_CIRCLE;
    spawns.push({
      id: i,
      x: Math.cos(angle) * ENEMY_SPAWN_RADIUS,
      z: Math.sin(angle) * ENEMY_SPAWN_RADIUS,
      health: ENEMY_MAX_HEALTH,
    });
  }
  return spawns;
}

const enemies = shallowRef<Array<EnemySpawn>>(createEnemySpawns());
const defeatedEnemies = ref(new Set<number>());

const enemiesRemaining = computed(() => ENEMY_COUNT - defeatedEnemies.value.size);

// Build floating health bar data from live refs
const healthBars = computed(() => {
  const bars: Array<{
    screenX: number;
    screenY: number;
    isVisible: boolean;
    current: number;
    max: number;
    label: string;
    color: string;
  }> = [];

  // Player health bar
  const player = playerRef.value;
  if (player !== null && player !== undefined) {
    bars.push({
      screenX: player.screenX,
      screenY: player.screenY,
      isVisible: player.isVisible,
      current: playerHealth.value,
      max: PLAYER_MAX_HEALTH,
      label: "Player",
      color: PLAYER_COLOR,
    });
  }

  // Enemy health bars
  for (const enemyComp of enemyRefs.value) {
    if (enemyComp !== null && enemyComp !== undefined && enemyComp.isAlive === true) {
      bars.push({
        screenX: enemyComp.screenX,
        screenY: enemyComp.screenY,
        isVisible: enemyComp.isVisible,
        current: enemyComp.health,
        max: ENEMY_MAX_HEALTH,
        label: "Enemy",
        color: ENEMY_COLOR,
      });
    }
  }

  return bars;
});

function onWeaponHit({ enemyEid }: { enemyEid: number }): void {
  if (gameState.value !== "playing") {
    return;
  }

  for (const enemyComp of enemyRefs.value) {
    if (enemyComp !== null && enemyComp !== undefined && enemyComp.eid === enemyEid) {
      enemyComp.takeDamage({ amount: WEAPON_DAMAGE });
      break;
    }
  }
}

function onEnemyContactPlayer(): void {
  if (gameState.value !== "playing") {
    return;
  }
  playerRef.value?.takeDamage();
}

function onPlayerHealthChanged({ current }: { current: number; max: number }): void {
  playerHealth.value = current;
}

function onPlayerDefeated(): void {
  gameState.value = "defeat";
}

function onEnemyDefeated({ enemyId }: { enemyId: number }): void {
  defeatedEnemies.value = new Set([...defeatedEnemies.value, enemyId]);
  if (defeatedEnemies.value.size >= ENEMY_COUNT) {
    gameState.value = "victory";
  }
}

function onRestart(): void {
  // Reload the page to reset all ECS state cleanly
  window.location.reload();
}

function setEnemyRef({ index, el }: { index: number; el: unknown }): void {
  const refs = [...enemyRefs.value];
  refs[index] = el as InstanceType<typeof BrawlerEnemy>;
  enemyRefs.value = refs;
}
</script>

<template>
  <Scene name="arena-brawler" :default="true">
    <!-- Top-down angled camera -->
    <TresPerspectiveCamera :position="[0, 16, 10]" :look-at="[0, 0, 0]" :fov="45" />

    <!-- Lighting -->
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 12, 5]" :intensity="1.8" />
    <TresDirectionalLight :position="[-3, 8, -3]" :intensity="0.4" color="#6688cc" />

    <!-- Arena geometry -->
    <BrawlerArena />

    <!-- Player -->
    <BrawlerPlayer
      ref="playerRef"
      @defeated="onPlayerDefeated"
      @health-changed="(evt) => onPlayerHealthChanged(evt)"
      @weapon-hit="(evt) => onWeaponHit(evt)"
    />

    <!-- Enemies -->
    <BrawlerEnemy
      v-for="(spawn, index) in enemies"
      :key="spawn.id"
      :ref="(el) => setEnemyRef({ index, el })"
      :spawn="spawn"
      :player-eid="playerRef?.eid ?? 0"
      @contact-player="onEnemyContactPlayer"
      @defeated="(evt) => onEnemyDefeated(evt)"
    />

    <template #overlay>
      <BrawlerUI
        :game-state="gameState"
        :player-health="playerHealth"
        :health-bars="healthBars"
        :enemies-remaining="enemiesRemaining"
        @restart="onRestart"
      />
    </template>
  </Scene>
</template>
