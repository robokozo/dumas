<script setup lang="ts">
import { ref, shallowRef } from "vue";
import {
  Scene,
  useEcsComponent,
  usePhysics,
  createPhysics,
  createCylinderCollider,
  useSystem,
  useGame,
  usePointer,
  DumasEntity,
  PHYSICS_TYPE,
  TRANSFORM_TYPE,
} from "@dumas/core";
import type { PhysicsStore, TransformStore } from "@dumas/core";
import QuickDropBall from "./QuickDropBall.vue";
import QuickDropCup from "./QuickDropCup.vue";
import QuickDropUI from "./QuickDropUI.vue";
import {
  SECTIONS,
  SECTION_COUNT,
  PLATE_RADIUS,
  CUP_RADIUS,
  CUP_WALL_HEIGHT,
  CUP_PLACEMENT_RADIUS,
  SPIN_SPEED,
  MAX_BALLS,
  DROP_INTERVAL,
  SETTLE_DURATION,
  DROP_X,
  DROP_Z,
  DROP_Y,
  BALL_RADIUS,
} from "./types";

usePhysics({ gravity: [0, -9.81, 0] });

const { storeRegistry } = useGame();

// ── State ────────────────────────────────────────────────────────────────────

const score = ref(0);
const highScore = ref(0);
const lastDrop = ref<number | null>(null);
const isHolding = ref(false);
const pointer = usePointer();
const plateAngle = ref(0);
let nextBallId = 1;
let lastDropTimer = 0;
let lastBallTime = 0;
let settleTimer = -1;

interface ActiveBall {
  id: number;
  spawnX: number;
  spawnY: number;
  spawnZ: number;
}

const balls = shallowRef<Array<ActiveBall>>([]);
const ballEids = new Map<number, number>();
const cupEids: Array<number> = [];

// ── Spinning plate (kinematic flattened cylinder) ────────────────────────────

const createPlateBody = createPhysics({
  type: "kinematicPositionBased",
  colliders: {
    disc: createCylinderCollider({
      halfHeight: 0.06,
      radius: PLATE_RADIUS,
      friction: 0.5,
    }),
  },
});

const { eid: plateEid } = useEcsComponent({
  components: { physics: createPlateBody },
});

// ── Cup registration ─────────────────────────────────────────────────────────

function onCupRegistered({ index, eid }: { index: number; eid: number }): void {
  cupEids[index] = eid;
}

// ── Hold-to-drop controls ───────────────────────────────────────────────────

function startHolding(): void {
  if (isHolding.value === true) return;
  isHolding.value = true;
  lastBallTime = 0;
}

function stopHolding(): void {
  if (isHolding.value === false) return;
  isHolding.value = false;
  settleTimer = -1;
}

// ── Main system — spins plate, repositions cups, spawns balls, scores ───────

useSystem({
  components: [],
  fn: ({ elapsed, delta }) => {
    plateAngle.value = elapsed * SPIN_SPEED;

    const physStore = storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
    if (physStore === undefined) return;

    // Rotate the plate
    const plateBody = physStore.body[plateEid];
    if (plateBody !== undefined) {
      const halfAngle = plateAngle.value / 2;
      plateBody.setNextKinematicRotation({
        x: 0,
        y: Math.sin(halfAngle),
        z: 0,
        w: Math.cos(halfAngle),
      });
    }

    // Move each cup to orbit with the plate
    for (let i = 0; i < SECTION_COUNT; i++) {
      const cupEid = cupEids[i];
      if (cupEid === undefined) continue;

      const cupBody = physStore.body[cupEid];
      if (cupBody === undefined) continue;

      const cupAngle = (i / SECTION_COUNT) * Math.PI * 2 + plateAngle.value;
      const x = Math.cos(cupAngle) * CUP_PLACEMENT_RADIUS;
      const z = Math.sin(cupAngle) * CUP_PLACEMENT_RADIUS;

      cupBody.setNextKinematicTranslation({ x, y: 0.06, z });

      const halfCupAngle = cupAngle / 2;
      cupBody.setNextKinematicRotation({
        x: 0,
        y: Math.sin(halfCupAngle),
        z: 0,
        w: Math.cos(halfCupAngle),
      });
    }

    // Canvas click/tap drives hold state (in addition to button)
    if (pointer.isPressed.value === true && isHolding.value === false) {
      startHolding();
      // Reset score at round start
      score.value = 0;
    }
    if (pointer.isReleased.value === true && isHolding.value === true) {
      stopHolding();
    }

    // Spawn balls while holding
    if (isHolding.value === true && balls.value.length < MAX_BALLS) {
      if (elapsed - lastBallTime >= DROP_INTERVAL) {
        lastBallTime = elapsed;
        const newBall: ActiveBall = {
          id: nextBallId++,
          spawnX: DROP_X + (Math.random() - 0.5) * 0.1,
          spawnY: DROP_Y + (Math.random() - 0.5) * 0.1,
          spawnZ: DROP_Z + (Math.random() - 0.5) * 0.1,
        };
        balls.value = [...balls.value, newBall];
      }
    }

    // Start settle timer when player releases
    if (isHolding.value === false && balls.value.length > 0 && settleTimer === -1) {
      settleTimer = elapsed;
    }

    // Score after settle duration
    if (settleTimer !== -1 && elapsed - settleTimer > SETTLE_DURATION) {
      scoreBalls();
      settleTimer = -1;
    }

    // Remove balls that fell off
    const transformStore = storeRegistry.get(TRANSFORM_TYPE) as TransformStore | undefined;
    if (transformStore !== undefined) {
      const fallen: Array<number> = [];
      for (const ball of balls.value) {
        const eid = ballEids.get(ball.id);
        if (eid === undefined) continue;
        const by = transformStore.posY[eid]?.value ?? 0;
        if (by < -3) {
          fallen.push(ball.id);
        }
      }
      if (fallen.length > 0) {
        for (const id of fallen) {
          ballEids.delete(id);
        }
        balls.value = balls.value.filter((b) => fallen.indexOf(b.id) === -1);
      }
    }

    // Clear last drop notification
    if (lastDrop.value !== null) {
      lastDropTimer += delta;
      if (lastDropTimer > 1.5) {
        lastDrop.value = null;
      }
    }
  },
});

// ── Ball management ──────────────────────────────────────────────────────────

function onBallRegistered({ id, eid }: { id: number; eid: number }): void {
  ballEids.set(id, eid);
}

function scoreBalls(): void {
  const transformStore = storeRegistry.get(TRANSFORM_TYPE) as TransformStore | undefined;
  if (transformStore === undefined) return;

  let dropScore = 0;

  for (const ball of balls.value) {
    const eid = ballEids.get(ball.id);
    if (eid === undefined) continue;

    const bx = transformStore.posX[eid]?.value ?? 0;
    const by = transformStore.posY[eid]?.value ?? 0;
    const bz = transformStore.posZ[eid]?.value ?? 0;

    if (by < -1) continue;

    // Check which cup the ball is closest to
    let bestIndex = -1;
    let bestDist = Infinity;

    for (let i = 0; i < SECTION_COUNT; i++) {
      const cupAngle = (i / SECTION_COUNT) * Math.PI * 2 + plateAngle.value;
      const cx = Math.cos(cupAngle) * CUP_PLACEMENT_RADIUS;
      const cz = Math.sin(cupAngle) * CUP_PLACEMENT_RADIUS;
      const dx = bx - cx;
      const dz = bz - cz;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < bestDist && dist < CUP_RADIUS + BALL_RADIUS) {
        bestDist = dist;
        bestIndex = i;
      }
    }

    if (bestIndex >= 0) {
      dropScore += SECTIONS[bestIndex].points;
    }
  }

  score.value += dropScore;
  lastDrop.value = dropScore;
  lastDropTimer = 0;

  if (score.value > highScore.value) {
    highScore.value = score.value;
  }

  balls.value = [];
  ballEids.clear();
}
</script>

<template>
  <Scene name="quick-drop" :default="true">
    <!-- Isometric camera -->
    <TresPerspectiveCamera :position="[6, 8, 6]" :look-at="[0, 0, 0]" :fov="40" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 12, 5]" :intensity="0.8" />
    <TresDirectionalLight :position="[-3, 6, -2]" :intensity="0.3" color="#aaccff" />

    <!-- Ground -->
    <TresMesh :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[20, 20]" />
      <TresMeshStandardMaterial color="#111118" />
    </TresMesh>

    <!-- Spinning plate -->
    <DumasEntity :eid="plateEid">
      <TresMesh>
        <TresCylinderGeometry :args="[PLATE_RADIUS, PLATE_RADIUS, 0.12, 32]" />
        <TresMeshStandardMaterial color="#222230" />
      </TresMesh>
    </DumasEntity>

    <!-- Cups around the perimeter -->
    <QuickDropCup
      v-for="(section, i) in SECTIONS"
      :key="i"
      :cup-radius="CUP_RADIUS"
      :wall-height="CUP_WALL_HEIGHT"
      :color="section.color"
      @registered="(evt) => onCupRegistered({ index: i, eid: evt.eid })"
    />

    <!-- Drop chute indicator -->
    <TresMesh :position="[DROP_X, DROP_Y - 0.5, DROP_Z]">
      <TresCylinderGeometry :args="[0.2, 0.3, 0.4, 8]" />
      <TresMeshStandardMaterial color="#44cc78" :transparent="true" :opacity="0.3" />
    </TresMesh>
    <!-- Chute pole -->
    <TresMesh :position="[DROP_X, DROP_Y / 2, DROP_Z]">
      <TresCylinderGeometry :args="[0.03, 0.03, DROP_Y, 4]" />
      <TresMeshStandardMaterial color="#333344" />
    </TresMesh>

    <!-- Balls -->
    <QuickDropBall
      v-for="ball in balls"
      :key="ball.id"
      :spawn-x="ball.spawnX"
      :spawn-y="ball.spawnY"
      :spawn-z="ball.spawnZ"
      @registered="(evt) => onBallRegistered({ id: ball.id, eid: evt.eid })"
    />

    <template #overlay>
      <QuickDropUI
        :score="score"
        :high-score="highScore"
        :last-drop="lastDrop"
        :is-holding="isHolding"
        :ball-count="balls.length"
        @hold-start="() => startHolding()"
        @hold-end="() => stopHolding()"
      />
    </template>
  </Scene>
</template>
