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
  PROJECTILE_DAMAGE,
} from "./constants";
import type { EnemySpawn, GameState, ProjectileSpawn } from "./types";
import BrawlerPlayer from "./BrawlerPlayer.vue";
import BrawlerEnemy from "./BrawlerEnemy.vue";
import BrawlerArena from "./BrawlerArena.vue";
import BrawlerUI from "./BrawlerUI.vue";
import BrawlerProjectile from "./BrawlerProjectile.vue";

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

const projectiles = shallowRef<Array<ProjectileSpawn>>([]);
let nextProjectileId = 0;

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

function onEnemyShoot({
  x,
  z,
  dirX,
  dirZ,
}: {
  x: number;
  z: number;
  dirX: number;
  dirZ: number;
}): void {
  if (gameState.value !== "playing") {
    return;
  }
  const id = nextProjectileId++;
  projectiles.value = [...projectiles.value, { id, x, z, dirX, dirZ }];
}

function onProjectileHitPlayer({ projectileId }: { projectileId: number }): void {
  removeProjectile({ projectileId });
  playerRef.value?.takeDamage({ amount: PROJECTILE_DAMAGE });
}

function onProjectileExpired({ projectileId }: { projectileId: number }): void {
  removeProjectile({ projectileId });
}

function removeProjectile({ projectileId }: { projectileId: number }): void {
  projectiles.value = projectiles.value.filter((p) => p.id !== projectileId);
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

    <!-- Enemies — only render after the player has mounted so playerEid is valid -->
    <template v-if="playerRef !== null">
      <BrawlerEnemy
        v-for="(spawn, index) in enemies"
        :key="spawn.id"
        :ref="(el) => setEnemyRef({ index, el })"
        :spawn="spawn"
        :player-eid="playerRef.eid"
        @contact-player="onEnemyContactPlayer"
        @defeated="(evt) => onEnemyDefeated(evt)"
        @shoot="(evt) => onEnemyShoot(evt)"
      />
    </template>

    <!-- Enemy projectiles -->
    <BrawlerProjectile
      v-for="proj in projectiles"
      :key="proj.id"
      :spawn="proj"
      @hit-player="(evt) => onProjectileHitPlayer(evt)"
      @expired="(evt) => onProjectileExpired(evt)"
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
