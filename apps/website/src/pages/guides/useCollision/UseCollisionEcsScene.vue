<script setup lang="ts">
/**
 * Demo: useCollision with ECS component filtering.
 *
 * Red "sword" balls bounce around.
 * Blue "target" balls bounce around.
 *
 * useCollision only fires when a sword ball hits a target ball.
 * Sword-on-sword contacts are ignored by the filter even though
 * physics still resolves those collisions normally.
 *
 * Hit targets flash white briefly to show the callback fired.
 */
import { shallowRef } from "vue";
import {
  Scene,
  useEcsComponent,
  usePhysics,
  createPhysics,
  createSphereCollider,
  createCuboidCollider,
  useCollision,
  DumasEntity,
} from "@dumas/core";
import type { ComponentFactory, ComponentStore } from "@dumas/core";

// ── Minimal tag factories ──────────────────────────────────────────────────────
interface TagStore extends ComponentStore {}

function makeTagFactory(): ComponentFactory<TagStore> {
  const type: symbol = Symbol();
  return Object.assign((): TagStore => ({}), { __type: type });
}

const createSwordTag = makeTagFactory();
const createTargetTag = makeTagFactory();

// ── Setup ──────────────────────────────────────────────────────────────────────

const ARENA = 4.5;
const flashSet = shallowRef(new Set<number>());

usePhysics({ gravity: [0, 0, 0] });

// Boundary walls — four solid walls forming a box arena
const WALLS = [
  { x: 0, y: ARENA, halfW: ARENA, halfH: 0.2 },
  { x: 0, y: -ARENA, halfW: ARENA, halfH: 0.2 },
  { x: ARENA, y: 0, halfW: 0.2, halfH: ARENA },
  { x: -ARENA, y: 0, halfW: 0.2, halfH: ARENA },
] as const;

for (const wall of WALLS) {
  const { transform } = useEcsComponent({
    components: {
      physics: createPhysics({
        type: "fixed",
        colliders: {
          wall: createCuboidCollider({
            halfExtents: [wall.halfW, wall.halfH, 1],
            restitution: 1,
            friction: 0,
          }),
        },
      }),
    },
  });
  transform.posX.value = wall.x;
  transform.posY.value = wall.y;
}

// ── Sword balls (red) — 2 balls with predictable diagonal paths ────────────────
interface BallEntry {
  eid: number;
}
const swordBalls: Array<BallEntry> = [];

const SWORD_CONFIGS = [
  { x: -3, y: 2, vx: 3.5, vy: -2.5 },
  { x: 2, y: -3, vx: -2.5, vy: 3.5 },
] as const;

for (const cfg of SWORD_CONFIGS) {
  const { eid, transform } = useEcsComponent({
    components: {
      physics: createPhysics({
        type: "dynamic",
        gravityScale: 0,
        linearDamping: 0,
        linvel: { x: cfg.vx, y: cfg.vy, z: 0 },
        colliders: { body: createSphereCollider({ radius: 0.45, restitution: 1, friction: 0 }) },
      }),
      sword: createSwordTag,
    },
  });
  transform.posX.value = cfg.x;
  transform.posY.value = cfg.y;
  swordBalls.push({ eid });
}

// ── Target balls (blue) — 3 balls, slower ─────────────────────────────────────
const targetBalls: Array<BallEntry> = [];

const TARGET_CONFIGS = [
  { x: 2, y: 2, vx: -1.5, vy: -2 },
  { x: -2, y: -2, vx: 2, vy: 1.5 },
  { x: 0, y: 0, vx: 1, vy: -1.5 },
] as const;

for (const cfg of TARGET_CONFIGS) {
  const { eid, transform } = useEcsComponent({
    components: {
      physics: createPhysics({
        type: "dynamic",
        gravityScale: 0,
        linearDamping: 0,
        linvel: { x: cfg.vx, y: cfg.vy, z: 0 },
        colliders: { body: createSphereCollider({ radius: 0.45, restitution: 1, friction: 0 }) },
      }),
      target: createTargetTag,
    },
  });
  transform.posX.value = cfg.x;
  transform.posY.value = cfg.y;
  targetBalls.push({ eid });

  useCollision({
    eid,
    other: { sword: createSwordTag },
    onContact({ otherEid: _otherEid }) {
      const next = new Set(flashSet.value);
      next.add(eid);
      flashSet.value = next;
      setTimeout(() => {
        const s = new Set(flashSet.value);
        s.delete(eid);
        flashSet.value = s;
      }, 250);
    },
  });
}
</script>

<template>
  <Scene name="ecs-collision-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 0, 16]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.5" />

    <!-- Arena background -->
    <TresMesh>
      <TresBoxGeometry :args="[ARENA * 2, ARENA * 2, 0.1]" />
      <TresMeshStandardMaterial color="#111827" />
    </TresMesh>

    <DumasEntity v-for="s in swordBalls" :key="s.eid" :eid="s.eid">
      <TresMesh>
        <TresSphereGeometry :args="[0.45, 12, 12]" />
        <TresMeshStandardMaterial color="#ff4444" :emissive="'#ff2200'" :emissive-intensity="0.6" />
      </TresMesh>
    </DumasEntity>

    <DumasEntity v-for="t in targetBalls" :key="t.eid" :eid="t.eid">
      <TresMesh>
        <TresSphereGeometry :args="[0.45, 12, 12]" />
        <TresMeshStandardMaterial
          :color="flashSet.has(t.eid) ? '#ffffff' : '#4488ff'"
          :emissive="flashSet.has(t.eid) ? '#ffffff' : '#001133'"
          :emissive-intensity="flashSet.has(t.eid) ? 3 : 0.2"
        />
      </TresMesh>
    </DumasEntity>

    <template #overlay>
      <div class="legend">
        <span class="dot red" /> sword &nbsp; <span class="dot blue" /> target &nbsp;&nbsp; filter:
        <code>other → sword</code>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.legend {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  font-family: sans-serif;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
}
.legend code {
  color: #4af;
}
.dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.2rem;
  vertical-align: middle;
}
.dot.red {
  background: #ff4444;
}
.dot.blue {
  background: #4488ff;
}
</style>
