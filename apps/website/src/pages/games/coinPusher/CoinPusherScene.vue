<script setup lang="ts">
import { ref } from "vue";
import {
  Scene,
  useEcsComponent,
  usePhysics,
  createPhysics,
  createCuboidCollider,
  useSystem,
  useGame,
  defineInputMap,
  useInput,
  PHYSICS_TYPE,
  DumasEntity,
} from "@dumas/core";
import type { PhysicsStore } from "@dumas/core";
import GoldCoin from "./GoldCoin.vue";
import SilverCoin from "./SilverCoin.vue";
import CopperCoin from "./CopperCoin.vue";

// ── Constants ──────────────────────────────────────────────────────────────────
const PLAYER_SPEED = 6;
const SHELF_HALF = 4;
const MAX_COINS = 60;
const DROP_COOLDOWN_DURATION = 0.4;

// Shelf spans z = -3 (back wall) to +3 (scoring/front edge).
// Pusher halfZ = 1.5, center oscillates ±1.5:
//   sin = -1 → center = -1.5 → back face at -3.0 (flush with back wall)
//   sin = +1 → center = +1.5 → front face at +3.0 (scoring edge)
// Full sweep, no gaps at either end.
const PUSHER_Z_CENTER = -3;
const PUSHER_OSCILLATION_AMPLITUDE = 1.5;
const PUSHER_OSCILLATION_SPEED = 0.7;
const PUSHER_Y = 0.35;
const PUSHER_HALF_X = 4.4;
const PUSHER_HALF_Y = 0.45;
const PUSHER_HALF_Z = 1.5;

// Walls: bottom sits on shelf surface (y=0.1), top at y=5.
const WALL_HALF_Y = 2.45;
const WALL_Y_CENTER = 2.55; // 0.1 shelf top + 2.45 half = 2.55

type CoinKind = "gold" | "silver" | "copper";

// Coins pre-placed near the front edge, stacked in 3 Y layers.
// Front edge is at z=3; coins sit at z=1.8–2.6 so they are close but stable.
interface InitialCoin {
  x: number;
  y: number;
  z: number;
  kind: CoinKind;
}

function makeRow({
  z,
  y,
  offset,
  kinds,
}: {
  z: number;
  y: number;
  offset: number;
  kinds: Array<CoinKind>;
}): Array<InitialCoin> {
  const xs = [-3.6, -2.7, -1.8, -0.9, 0.0, 0.9, 1.8, 2.7, 3.6];
  return xs.map((x, i) => ({ x: x + offset, y, z, kind: kinds[i % kinds.length] }));
}

const BASE_KINDS: Array<CoinKind> = [
  "gold",
  "silver",
  "copper",
  "gold",
  "silver",
  "copper",
  "gold",
  "silver",
  "copper",
];
const INITIAL_COINS: Array<InitialCoin> = [
  // Layer 1 — ground level, z=1.6 to 2.4
  ...makeRow({ z: 1.6, y: 0.18, offset: 0, kinds: BASE_KINDS }),
  ...makeRow({
    z: 2.0,
    y: 0.18,
    offset: 0.4,
    kinds: ["gold", "gold", "silver", "silver", "copper", "copper", "gold", "silver", "copper"],
  }),
  ...makeRow({
    z: 2.4,
    y: 0.18,
    offset: 0,
    kinds: ["copper", "gold", "silver", "copper", "gold", "silver", "copper", "gold", "silver"],
  }),
  // Layer 2 — stacked on top, z=1.6 to 2.4
  ...makeRow({
    z: 1.7,
    y: 0.42,
    offset: 0.45,
    kinds: ["silver", "gold", "copper", "gold", "silver", "gold", "copper", "silver", "gold"],
  }),
  ...makeRow({
    z: 2.1,
    y: 0.42,
    offset: 0,
    kinds: ["gold", "copper", "gold", "silver", "gold", "copper", "silver", "gold", "copper"],
  }),
  ...makeRow({
    z: 2.5,
    y: 0.42,
    offset: 0.45,
    kinds: ["copper", "silver", "gold", "copper", "silver", "gold", "copper", "silver", "gold"],
  }),
  // Layer 3 — top stack
  ...makeRow({
    z: 1.8,
    y: 0.66,
    offset: 0,
    kinds: ["gold", "gold", "silver", "copper", "gold", "silver", "copper", "gold", "silver"],
  }),
  ...makeRow({
    z: 2.2,
    y: 0.66,
    offset: 0.45,
    kinds: ["silver", "copper", "gold", "silver", "copper", "gold", "silver", "copper", "gold"],
  }),
];

// Coins are dropped near the back wall — they land behind the pusher and
// get swept forward on the next extension stroke.
const COIN_DROP_Z = -2.3;

// ── Physics world ──────────────────────────────────────────────────────────────
usePhysics({ gravity: [0, -9.81, 0] });

const gameCtx = useGame();

// ── Shelf (fixed) ──────────────────────────────────────────────────────────────
useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        shelf: createCuboidCollider({ halfExtents: [4.5, 0.1, 3] }),
      },
    }),
  },
});

// Back wall center at z=-3.2 so its front face is exactly at z=-3.0,
// flush with the pusher back face at full retraction.
const { transform: backWallTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [4.6, WALL_HALF_Y, 0.2] }),
      },
    }),
  },
});
backWallTransform.posX.value = 0;
backWallTransform.posY.value = WALL_Y_CENTER;
backWallTransform.posZ.value = -3.2;

const { transform: leftWallTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [0.1, WALL_HALF_Y, 3.2] }),
      },
    }),
  },
});
leftWallTransform.posX.value = -4.6;
leftWallTransform.posY.value = WALL_Y_CENTER;
leftWallTransform.posZ.value = 0;

const { transform: rightWallTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [0.1, WALL_HALF_Y, 3.2] }),
      },
    }),
  },
});
rightWallTransform.posX.value = 4.6;
rightWallTransform.posY.value = WALL_Y_CENTER;
rightWallTransform.posZ.value = 0;

// ── Pusher (kinematic) ────────────────────────────────────────────────────────
const { eid: pusherEid, transform: pusherTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "kinematicPositionBased",
      colliders: {
        body: createCuboidCollider({ halfExtents: [PUSHER_HALF_X, PUSHER_HALF_Y, PUSHER_HALF_Z] }),
      },
    }),
  },
});
pusherTransform.posX.value = 0;
pusherTransform.posY.value = PUSHER_Y;
pusherTransform.posZ.value = PUSHER_Z_CENTER - PUSHER_OSCILLATION_AMPLITUDE;

// ── Pusher oscillation system ─────────────────────────────────────────────────
useSystem({
  components: [],
  fn: ({ elapsed }) => {
    const store = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
    if (store === undefined) return;
    const pusherBody = store.body[pusherEid];
    if (pusherBody === undefined) return;
    const z =
      PUSHER_Z_CENTER - Math.cos(elapsed * PUSHER_OSCILLATION_SPEED) * PUSHER_OSCILLATION_AMPLITUDE;
    pusherBody.setNextKinematicTranslation({ x: 0, y: PUSHER_Y, z });
  },
});

// ── Player state ──────────────────────────────────────────────────────────────
const playerX = ref(0);
const isTouchingLeft = ref(false);
const isTouchingRight = ref(false);

function onMoveLeftDown(): void {
  isTouchingLeft.value = true;
}
function onMoveLeftUp(): void {
  isTouchingLeft.value = false;
}
function onMoveRightDown(): void {
  isTouchingRight.value = true;
}
function onMoveRightUp(): void {
  isTouchingRight.value = false;
}

// ── Coin management ───────────────────────────────────────────────────────────
interface CoinState {
  id: number;
  x: number;
  y: number;
  z: number;
  kind: CoinKind;
}

// Randomly pick a coin kind to drop, weighted toward common coins.
const DROP_KINDS: Array<CoinKind> = ["gold", "gold", "gold", "silver", "silver", "copper"];

let nextId = 0;
const coins = ref<Array<CoinState>>([]);
const score = ref(0);

function dropCoin({ x }: { x: number }): void {
  if (coins.value.length >= MAX_COINS) {
    coins.value = coins.value.slice(1);
  }
  const kind = DROP_KINDS[Math.floor(Math.random() * DROP_KINDS.length)];
  coins.value = [...coins.value, { id: nextId++, x, y: 2.5, z: COIN_DROP_Z, kind }];
}

const COIN_POINTS: Record<CoinKind, number> = { gold: 3, silver: 2, copper: 1 };

function onCoinScored({ id, points }: { id: number; points: number }): void {
  score.value += points;
  coins.value = coins.value.filter((c) => c.id !== id);
}

// Pre-spawn initial coins stacked near the front edge.
for (const coin of INITIAL_COINS) {
  coins.value.push({ id: nextId++, x: coin.x, y: coin.y, z: coin.z, kind: coin.kind });
}

// ── Input ─────────────────────────────────────────────────────────────────────
const INPUT_MAP = defineInputMap({
  left: ({ keys }) => keys["a"]?.value === true || keys["arrowleft"]?.value === true,
  right: ({ keys }) => keys["d"]?.value === true || keys["arrowright"]?.value === true,
  drop: ({ keys }) => keys["space"]?.value === true,
});

let dropCooldown = 0;

function onDropDown(): void {
  if (dropCooldown === 0) {
    dropCooldown = DROP_COOLDOWN_DURATION;
    dropCoin({ x: playerX.value });
  }
}

useInput({
  map: INPUT_MAP,
  fn: ({ delta, held, pressed }) => {
    if (held.left.value === true) {
      playerX.value = Math.max(-SHELF_HALF, playerX.value - PLAYER_SPEED * delta);
    }
    if (held.right.value === true) {
      playerX.value = Math.min(SHELF_HALF, playerX.value + PLAYER_SPEED * delta);
    }

    if (dropCooldown > 0) {
      dropCooldown = Math.max(0, dropCooldown - delta);
    }

    if (pressed.drop.value === true && dropCooldown === 0) {
      dropCooldown = DROP_COOLDOWN_DURATION;
      dropCoin({ x: playerX.value });
    }
  },
});

// Separate system so touch movement works independently of keyboard focus.
useSystem({
  components: [],
  fn: ({ delta }) => {
    if (isTouchingLeft.value === true) {
      playerX.value = Math.max(-SHELF_HALF, playerX.value - PLAYER_SPEED * delta);
    }
    if (isTouchingRight.value === true) {
      playerX.value = Math.min(SHELF_HALF, playerX.value + PLAYER_SPEED * delta);
    }
  },
});
</script>

<template>
  <Scene name="coin-pusher" :default="true">
    <TresPerspectiveCamera :position="[0, 8, 13]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.4" />
    <!-- Key: warm overhead-front -->
    <TresDirectionalLight :position="[3, 10, 10]" :intensity="1.8" color="#fff8ee" />
    <!-- Fill: cool from left -->
    <TresDirectionalLight :position="[-6, 4, 2]" :intensity="0.6" color="#aaccff" />
    <!-- Rim: back-right to separate pusher from wall -->
    <TresDirectionalLight :position="[5, 6, -8]" :intensity="0.5" color="#ffeedd" />
    <!-- Warm point: low over front of shelf, gold coins glow -->
    <TresPointLight :position="[0, 3, 2]" :intensity="35" :distance="12" color="#ffdd66" />
    <!-- Cool point: left side accent -->
    <TresPointLight :position="[-4, 2, 0]" :intensity="12" :distance="9" color="#88bbff" />
    <!-- Cool point: right side accent -->
    <TresPointLight :position="[4, 2, 0]" :intensity="12" :distance="9" color="#88bbff" />

    <!-- Shelf visual -->
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[9, 0.2, 6]" />
      <TresMeshStandardMaterial color="#1a1a2e" />
    </TresMesh>

    <!-- Back wall visual -->
    <TresMesh :position="[0, WALL_Y_CENTER, -3.2]">
      <TresBoxGeometry :args="[9.2, WALL_HALF_Y * 2, 0.4]" />
      <TresMeshStandardMaterial color="#1a1a2e" />
    </TresMesh>

    <!-- Left wall visual -->
    <TresMesh :position="[-4.6, WALL_Y_CENTER, 0]">
      <TresBoxGeometry :args="[0.2, WALL_HALF_Y * 2, 6.4]" />
      <TresMeshStandardMaterial color="#1a1a2e" />
    </TresMesh>

    <!-- Right wall visual -->
    <TresMesh :position="[4.6, WALL_Y_CENTER, 0]">
      <TresBoxGeometry :args="[0.2, WALL_HALF_Y * 2, 6.4]" />
      <TresMeshStandardMaterial color="#1a1a2e" />
    </TresMesh>

    <!-- Pusher visual -->
    <DumasEntity :eid="pusherEid">
      <TresMesh>
        <TresBoxGeometry :args="[PUSHER_HALF_X * 2, PUSHER_HALF_Y * 2, PUSHER_HALF_Z * 2]" />
        <TresMeshStandardMaterial color="#2a2a4a" />
      </TresMesh>
    </DumasEntity>

    <!-- Player drop indicator -->
    <TresMesh :position="[playerX, 3, COIN_DROP_Z]">
      <TresCylinderGeometry :args="[0.05, 0.05, 2, 6]" />
      <TresMeshStandardMaterial
        color="#ffffff"
        :emissive="'#ffffff'"
        :emissive-intensity="1"
        :transparent="true"
        :opacity="0.5"
      />
    </TresMesh>

    <!-- Coins & collectibles -->
    <template v-for="c in coins" :key="c.id">
      <GoldCoin
        v-if="c.kind === 'gold'"
        :start-x="c.x"
        :start-y="c.y"
        :start-z="c.z"
        @scored="(points) => onCoinScored({ id: c.id, points })"
      />
      <SilverCoin
        v-else-if="c.kind === 'silver'"
        :start-x="c.x"
        :start-y="c.y"
        :start-z="c.z"
        @scored="(points) => onCoinScored({ id: c.id, points })"
      />
      <CopperCoin
        v-else-if="c.kind === 'copper'"
        :start-x="c.x"
        :start-y="c.y"
        :start-z="c.z"
        @scored="(points) => onCoinScored({ id: c.id, points })"
      />
    </template>

    <template #overlay>
      <!-- Score display -->
      <div class="score">
        <span class="score__label">SCORE</span>
        <span class="score__value">{{ score }}</span>
        <span class="score__legend">
          <span class="score__legend-item score__legend-item--gold"
            >Gold +{{ COIN_POINTS.gold }}</span
          >
          <span class="score__legend-item score__legend-item--silver"
            >Silver +{{ COIN_POINTS.silver }}</span
          >
          <span class="score__legend-item score__legend-item--copper"
            >Copper +{{ COIN_POINTS.copper }}</span
          >
        </span>
      </div>

      <!-- Touch controls -->
      <div class="touch-controls">
        <button
          class="touch-btn touch-btn--move"
          @pointerdown="() => onMoveLeftDown()"
          @pointerup="() => onMoveLeftUp()"
          @pointercancel="() => onMoveLeftUp()"
          @pointerleave="() => onMoveLeftUp()"
        >
          ◀
        </button>
        <button class="touch-btn touch-btn--drop" @pointerdown="() => onDropDown()">DROP</button>
        <button
          class="touch-btn touch-btn--move"
          @pointerdown="() => onMoveRightDown()"
          @pointerup="() => onMoveRightUp()"
          @pointercancel="() => onMoveRightUp()"
          @pointerleave="() => onMoveRightUp()"
        >
          ▶
        </button>
      </div>

      <!-- Controls hint -->
      <div class="controls">
        <span class="controls__hint">A / D or ← → to move &nbsp;·&nbsp; Space to drop</span>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.score {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: sans-serif;
  pointer-events: none;
}

.score__label {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
}

.score__value {
  font-size: 2rem;
  font-weight: 700;
  color: #f0c040;
  line-height: 1;
}

.score__legend {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
  margin-top: 0.4rem;
}

.score__legend-item {
  font-size: 0.6rem;
  letter-spacing: 0.05em;
}

.score__legend-item--gold {
  color: #f0c040;
}
.score__legend-item--silver {
  color: #c0c8d8;
}
.score__legend-item--copper {
  color: #c87040;
}

.touch-controls {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  align-items: center;
  pointer-events: auto;
}

.touch-btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: rgba(255, 255, 255, 0.85);
  font-family: sans-serif;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  backdrop-filter: blur(4px);
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.touch-btn:active {
  background: rgba(255, 255, 255, 0.18);
}

.touch-btn--move {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.2rem;
}

.touch-btn--drop {
  width: 5rem;
  height: 3.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #f0c040;
  border-color: rgba(240, 192, 64, 0.4);
}

.controls {
  position: absolute;
  bottom: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.controls__hint {
  font-family: sans-serif;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}
</style>
