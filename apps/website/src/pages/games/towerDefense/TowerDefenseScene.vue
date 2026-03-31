<script setup lang="ts">
import { ref, shallowRef, triggerRef } from "vue";
import { Scene, useSystem, useGame, useEntityRef, TRANSFORM_TYPE } from "@dumas/core";
import type { TransformStore } from "@dumas/core";
import Tower from "./Tower.vue";
import Enemy from "./Enemy.vue";
import Projectile from "./Projectile.vue";
import {
  SPAWN_X,
  GOAL_X,
  PATH_Y,
  PATH_Z,
  ENEMY_SPEED,
  TOWER_SLOT_POSITIONS,
  TOWER_FIRE_INTERVAL,
  PROJECTILE_SPEED,
  PROJECTILE_HIT_DISTANCE,
  SPAWN_INTERVAL,
  ENEMIES_PER_WAVE,
  STARTING_LIVES,
  STARTING_GOLD,
  KILL_REWARD,
  TOWER_COST,
  TOWER_BASE_HEIGHT,
  TOWER_HEAD_HEIGHT,
} from "./constants";

// ── Game state ──────────────────────────────────────────────────────────────

const lives = ref(STARTING_LIVES);
const score = ref(0);
const gold = ref(STARTING_GOLD);
const wave = ref(1);
const isGameOver = ref(false);

// ── Tower slot state ────────────────────────────────────────────────────────

interface TowerSlot {
  x: number;
  z: number;
  isBuilt: boolean;
}

const towerSlots = ref<Array<TowerSlot>>(
  TOWER_SLOT_POSITIONS.map(({ x, z }) => ({ x, z, isBuilt: false })),
);

// Refs to tower component instances
const towerRefs = shallowRef<Array<InstanceType<typeof Tower> | null>>([null, null, null]);

function placeTower({ index }: { index: number }): void {
  if (isGameOver.value === true) return;
  if (towerSlots.value[index].isBuilt === true) return;
  if (gold.value < TOWER_COST) return;

  gold.value -= TOWER_COST;
  towerSlots.value[index].isBuilt = true;
}

// ── Enemy management ────────────────────────────────────────────────────────

interface EnemyInstance {
  id: number;
  eid: number;
  health: number;
  component: InstanceType<typeof Enemy> | null;
}

let nextEnemyId = 0;
const enemies = shallowRef<Array<EnemyInstance>>([]);
let spawnTimer = 0;
let enemiesSpawnedThisWave = 0;

function spawnEnemy(): void {
  const id = nextEnemyId++;
  const instance: EnemyInstance = {
    id,
    eid: -1,
    health: 3,
    component: null,
  };
  enemies.value = [...enemies.value, instance];
}

function removeEnemy({ id }: { id: number }): void {
  enemies.value = enemies.value.filter((e) => e.id !== id);
}

// ── Projectile management ───────────────────────────────────────────────────

interface ProjectileInstance {
  id: number;
  eid: number;
  targetEnemyId: number;
  component: InstanceType<typeof Projectile> | null;
}

let nextProjectileId = 0;
const projectiles = shallowRef<Array<ProjectileInstance>>([]);

// Per-tower fire cooldown
const towerCooldowns: Array<number> = [0, 0, 0];

function spawnProjectile({
  fromX,
  fromY,
  fromZ,
  targetEnemyId,
}: {
  fromX: number;
  fromY: number;
  fromZ: number;
  targetEnemyId: number;
}): void {
  const id = nextProjectileId++;
  const instance: ProjectileInstance = {
    id,
    eid: -1,
    targetEnemyId,
    component: null,
  };
  projectiles.value = [...projectiles.value, instance];

  // We'll set the start position via the component props
  projectileSpawnPositions.set(id, { x: fromX, y: fromY, z: fromZ });
}

const projectileSpawnPositions = new Map<number, { x: number; y: number; z: number }>();

function removeProjectile({ id }: { id: number }): void {
  projectiles.value = projectiles.value.filter((p) => p.id !== id);
  projectileSpawnPositions.delete(id);
}

// ── Game store access ───────────────────────────────────────────────────────

const { storeRegistry } = useGame();

// ── Main game system ────────────────────────────────────────────────────────

useSystem({
  fn({ delta }) {
    if (isGameOver.value === true) return;

    const transformStore = storeRegistry.get(TRANSFORM_TYPE) as TransformStore | undefined;
    if (transformStore === undefined) return;

    // ── Spawn enemies ───────────────────────────────────────────────────
    spawnTimer += delta;
    if (spawnTimer >= SPAWN_INTERVAL && enemiesSpawnedThisWave < ENEMIES_PER_WAVE) {
      spawnTimer = 0;
      enemiesSpawnedThisWave++;
      spawnEnemy();
    }

    // ── Check if wave is complete (all enemies spawned and destroyed) ───
    if (enemiesSpawnedThisWave >= ENEMIES_PER_WAVE && enemies.value.length === 0) {
      wave.value++;
      enemiesSpawnedThisWave = 0;
      spawnTimer = 0;
      gold.value += 2; // Bonus gold between waves
    }

    // ── Move enemies along the path ─────────────────────────────────────
    const enemiesToRemove: Array<number> = [];

    for (const enemy of enemies.value) {
      if (enemy.component === null) continue;
      const eid = enemy.component.eid;
      if (eid === undefined) continue;
      enemy.eid = eid;

      const posX = transformStore.posX[eid];
      if (posX === undefined) continue;

      posX.value += ENEMY_SPEED * delta;

      // Enemy reached the goal
      if (posX.value >= GOAL_X) {
        enemiesToRemove.push(enemy.id);
        lives.value--;
        if (lives.value <= 0) {
          isGameOver.value = true;
        }
      }
    }

    for (const id of enemiesToRemove) {
      removeEnemy({ id });
    }

    // ── Tower firing logic ──────────────────────────────────────────────
    for (let i = 0; i < towerSlots.value.length; i++) {
      if (towerSlots.value[i].isBuilt !== true) continue;

      towerCooldowns[i] = Math.max(0, towerCooldowns[i] - delta);

      const towerComp = towerRefs.value[i];
      if (towerComp === null) continue;

      const enemiesInRange = towerComp.enemiesInRange;
      if (enemiesInRange === undefined || enemiesInRange.size === 0) continue;

      // Rotate turret head toward the first enemy in range
      const firstEnemyEid = enemiesInRange.values().next().value;
      if (firstEnemyEid === undefined) continue;

      const headEid = towerComp.headEid;
      if (headEid === undefined) continue;

      const headPosX = transformStore.posX[headEid];
      const headPosZ = transformStore.posZ[headEid];
      const enemyPosX = transformStore.posX[firstEnemyEid];
      const enemyPosZ = transformStore.posZ[firstEnemyEid];
      const headRotY = transformStore.rotY[headEid];

      if (
        headPosX !== undefined &&
        headPosZ !== undefined &&
        enemyPosX !== undefined &&
        enemyPosZ !== undefined &&
        headRotY !== undefined
      ) {
        const dx = enemyPosX.value - headPosX.value;
        const dz = enemyPosZ.value - headPosZ.value;
        headRotY.value = Math.atan2(dx, dz);
      }

      // Fire when cooldown is ready
      if (towerCooldowns[i] <= 0) {
        towerCooldowns[i] = TOWER_FIRE_INTERVAL;

        // Find the enemy instance by eid
        const targetEnemy = enemies.value.find((e) => e.eid === firstEnemyEid);
        if (targetEnemy !== null && targetEnemy !== undefined) {
          const slot = towerSlots.value[i];
          spawnProjectile({
            fromX: slot.x,
            fromY: TOWER_BASE_HEIGHT + TOWER_HEAD_HEIGHT,
            fromZ: slot.z,
            targetEnemyId: targetEnemy.id,
          });
        }
      }
    }

    // ── Move projectiles toward targets ─────────────────────────────────
    const projectilesToRemove: Array<number> = [];

    for (const proj of projectiles.value) {
      if (proj.component === null) continue;
      const eid = proj.component.eid;
      if (eid === undefined) continue;
      proj.eid = eid;

      const projPosX = transformStore.posX[eid];
      const projPosY = transformStore.posY[eid];
      const projPosZ = transformStore.posZ[eid];
      if (projPosX === undefined || projPosY === undefined || projPosZ === undefined) continue;

      // Find target enemy
      const target = enemies.value.find((e) => e.id === proj.targetEnemyId);
      if (target === undefined || target.component === null) {
        projectilesToRemove.push(proj.id);
        continue;
      }

      const targetEid = target.eid;
      const targetPosX = transformStore.posX[targetEid];
      const targetPosY = transformStore.posY[targetEid];
      const targetPosZ = transformStore.posZ[targetEid];
      if (targetPosX === undefined || targetPosY === undefined || targetPosZ === undefined) {
        projectilesToRemove.push(proj.id);
        continue;
      }

      // Direction toward target
      const dx = targetPosX.value - projPosX.value;
      const dy = targetPosY.value - projPosY.value;
      const dz = targetPosZ.value - projPosZ.value;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < PROJECTILE_HIT_DISTANCE) {
        // Hit!
        projectilesToRemove.push(proj.id);
        target.health--;
        if (target.health <= 0) {
          removeEnemy({ id: target.id });
          score.value++;
          gold.value += KILL_REWARD;
        }
      } else {
        // Move toward target
        const speed = PROJECTILE_SPEED * delta;
        projPosX.value += (dx / dist) * speed;
        projPosY.value += (dy / dist) * speed;
        projPosZ.value += (dz / dist) * speed;
      }
    }

    for (const id of projectilesToRemove) {
      removeProjectile({ id });
    }
  },
});

function restartGame(): void {
  lives.value = STARTING_LIVES;
  score.value = 0;
  gold.value = STARTING_GOLD;
  wave.value = 1;
  isGameOver.value = false;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;
  enemies.value = [];
  projectiles.value = [];
  towerSlots.value = TOWER_SLOT_POSITIONS.map(({ x, z }) => ({ x, z, isBuilt: false }));
  towerCooldowns.fill(0);
}
</script>

<template>
  <Scene name="tower-defense" :default="true">
    <!-- Top-down camera -->
    <TresPerspectiveCamera :position="[0, 18, 8]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.6" />
    <TresDirectionalLight :position="[5, 12, 5]" :intensity="1.8" />

    <!-- Ground plane -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -0.01, 0]">
      <TresPlaneGeometry :args="[28, 16]" />
      <TresMeshStandardMaterial color="#1a2a1a" />
    </TresMesh>

    <!-- Path (visual lane from spawn to goal) -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.01, PATH_Z]">
      <TresPlaneGeometry :args="[22, 1.2]" />
      <TresMeshStandardMaterial color="#2a2a20" />
    </TresMesh>

    <!-- Spawn marker -->
    <TresMesh :position="[SPAWN_X, 0.3, PATH_Z]">
      <TresBoxGeometry :args="[0.6, 0.6, 0.6]" />
      <TresMeshStandardMaterial color="#44ff44" emissive="#22aa22" :emissive-intensity="0.8" />
    </TresMesh>

    <!-- Goal marker -->
    <TresMesh :position="[GOAL_X, 0.3, PATH_Z]">
      <TresBoxGeometry :args="[0.6, 0.6, 0.6]" />
      <TresMeshStandardMaterial color="#ff4444" emissive="#aa2222" :emissive-intensity="0.8" />
    </TresMesh>

    <!-- Tower slots (empty or built) -->
    <template v-for="(slot, index) in towerSlots" :key="index">
      <!-- Empty slot indicator -->
      <TresMesh
        v-if="slot.isBuilt !== true"
        :position="[slot.x, 0.05, slot.z]"
        :rotation="[-Math.PI / 2, 0, 0]"
      >
        <TresRingGeometry :args="[0.5, 0.65, 8]" />
        <TresMeshBasicMaterial color="#556655" :transparent="true" :opacity="0.5" :side="2" />
      </TresMesh>

      <!-- Built tower -->
      <Tower
        v-if="slot.isBuilt === true"
        :ref="
          (el: unknown) => {
            towerRefs[index] = el as InstanceType<typeof Tower> | null;
          }
        "
        :pos-x="slot.x"
        :pos-z="slot.z"
      />
    </template>

    <!-- Enemies -->
    <Enemy
      v-for="enemy in enemies"
      :key="enemy.id"
      :ref="
        (el: unknown) => {
          enemy.component = el as InstanceType<typeof Enemy> | null;
        }
      "
      :spawn-offset="0"
    />

    <!-- Projectiles -->
    <Projectile
      v-for="proj in projectiles"
      :key="proj.id"
      :ref="
        (el: unknown) => {
          proj.component = el as InstanceType<typeof Projectile> | null;
        }
      "
      :start-x="projectileSpawnPositions.get(proj.id)?.x ?? 0"
      :start-y="projectileSpawnPositions.get(proj.id)?.y ?? 1"
      :start-z="projectileSpawnPositions.get(proj.id)?.z ?? 0"
    />

    <!-- HUD overlay -->
    <template #overlay>
      <div class="hud">
        <div class="hud__top">
          <span class="hud__stat hud__lives">Lives: {{ lives }}</span>
          <span class="hud__stat hud__wave">Wave {{ wave }}</span>
          <span class="hud__stat hud__score">Score: {{ score }}</span>
          <span class="hud__stat hud__gold">Gold: {{ gold }}</span>
        </div>

        <div class="hud__towers">
          <button
            v-for="(slot, index) in towerSlots"
            :key="index"
            class="tower-btn"
            :class="{
              'tower-btn--built': slot.isBuilt === true,
              'tower-btn--disabled': gold < TOWER_COST && slot.isBuilt !== true,
            }"
            :disabled="slot.isBuilt === true || gold < TOWER_COST"
            @click="() => placeTower({ index })"
          >
            {{ slot.isBuilt === true ? "Built" : `Place Tower (${TOWER_COST}g)` }}
          </button>
        </div>
      </div>

      <!-- Game over screen -->
      <div v-if="isGameOver === true" class="game-over">
        <div class="game-over__content">
          <h2>Game Over</h2>
          <p>Score: {{ score }} | Wave: {{ wave }}</p>
          <button class="restart-btn" @click="() => restartGame()">Restart</button>
        </div>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  font-family: monospace;
  padding: 0.75rem;
}

.hud__top {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.hud__stat {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.hud__lives {
  color: #ff6666;
}
.hud__wave {
  color: #aaaaff;
}
.hud__score {
  color: #ffcc44;
}
.hud__gold {
  color: #ffaa22;
}

.hud__towers {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  pointer-events: auto;
}

.tower-btn {
  font-family: monospace;
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: 1px solid rgba(68, 170, 255, 0.4);
  background: rgba(68, 170, 255, 0.15);
  color: #88ccff;
  cursor: pointer;
  transition: background 0.15s;
}

.tower-btn:hover:not(:disabled) {
  background: rgba(68, 170, 255, 0.3);
}

.tower-btn--built {
  border-color: rgba(100, 100, 100, 0.4);
  background: rgba(100, 100, 100, 0.15);
  color: #666;
  cursor: default;
}

.tower-btn--disabled {
  border-color: rgba(100, 100, 100, 0.3);
  color: #555;
  cursor: not-allowed;
}

.game-over {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  font-family: monospace;
}

.game-over__content {
  text-align: center;
  color: #fff;
}

.game-over__content h2 {
  font-size: 2rem;
  color: #ff4444;
  margin: 0 0 0.5rem;
}

.game-over__content p {
  color: #aaa;
  margin: 0 0 1rem;
}

.restart-btn {
  font-family: monospace;
  font-size: 0.9rem;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  border: 1px solid rgba(68, 255, 68, 0.5);
  background: rgba(68, 255, 68, 0.15);
  color: #66ff66;
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.15s;
}

.restart-btn:hover {
  background: rgba(68, 255, 68, 0.3);
}
</style>
