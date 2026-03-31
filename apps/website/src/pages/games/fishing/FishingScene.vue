<script setup lang="ts">
import { shallowRef, ref, computed } from "vue";
import {
  Scene,
  useEcsComponent,
  usePhysics,
  useSystem,
  useJoint,
  useWorldToScreen,
  createPhysics,
  createCuboidCollider,
  createSphereCollider,
  DumasEntity,
  defineInputMap,
  useInput,
} from "@dumas/core";
import Fish from "./Fish.vue";
import { FISH_SPECIES } from "./fishTypes";
import type { FishSpecies } from "./fishTypes";

// ─── constants ──────────────────────────────────────────────────────────────

const WALK_SPEED = 3;
const DOCK_LEFT = -3.5;
const DOCK_RIGHT = 3.5;
const CHARACTER_SPAWN_X = 0;
const CHARACTER_Y = 1.5;
const DOCK_Y = 1.0;
const WATER_Y = -0.3;
const BOBBER_RADIUS = 0.12;
const SPRING_REST_LENGTH = 3;
const SPRING_STIFFNESS = 8;
const SPRING_DAMPING = 1.5;
const ROD_TIP_OFFSET_X = 0.8;
const ROD_TIP_OFFSET_Y = 0.8;
const CAST_FORWARD_OFFSET = 2;
const BITE_DISTANCE = 1.2;
const BITE_CHANCE_PER_SECOND = 0.3;
const REEL_DURATION = 0.8;

// ─── game state ─────────────────────────────────────────────────────────────

type GamePhase = "idle" | "casting" | "waiting" | "biting" | "reeling";

const phase = shallowRef<GamePhase>("idle");
const catches = ref<Array<FishSpecies>>([]);
const bitingFishIndex = shallowRef<number | null>(null);
const reelTimer = shallowRef(0);
const castTimer = shallowRef(0);
const CAST_SETTLE_TIME = 0.6;

// ─── physics ────────────────────────────────────────────────────────────────

usePhysics({ gravity: [0, -9.81, 0] });

// ─── dock (fixed body) ─────────────────────────────────────────────────────

const DOCK_HALF_LENGTH = 4;
const DOCK_HALF_HEIGHT = 0.15;
const DOCK_HALF_WIDTH = 1.5;

const { eid: dockEid, transform: dockTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        platform: createCuboidCollider({
          halfExtents: [DOCK_HALF_LENGTH, DOCK_HALF_HEIGHT, DOCK_HALF_WIDTH],
        }),
      },
    }),
  },
});

dockTransform.posY.value = DOCK_Y;

// ─── character (no physics, transform-only movement) ────────────────────────

const INPUT_MAP = defineInputMap({
  left: ({ keys }) => keys.a?.value === true || keys.arrowleft?.value === true,
  right: ({ keys }) => keys.d?.value === true || keys.arrowright?.value === true,
  action: ({ keys }) => keys.space?.value === true,
});

const { eid: characterEid, transform: characterTransform } = useEcsComponent({ components: {} });
characterTransform.posX.value = CHARACTER_SPAWN_X;
characterTransform.posY.value = CHARACTER_Y;

// ─── rod tip (kinematic body, follows character) ────────────────────────────

const { eid: rodTipEid, transform: rodTipTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "kinematicPositionBased",
      colliders: {
        tip: createSphereCollider({ radius: 0.02 }),
      },
    }),
  },
});

rodTipTransform.posX.value = CHARACTER_SPAWN_X + ROD_TIP_OFFSET_X;
rodTipTransform.posY.value = CHARACTER_Y + ROD_TIP_OFFSET_Y;

// ─── bobber (dynamic body, spawned on cast) ─────────────────────────────────

const isBobberActive = shallowRef(false);

const { eid: bobberEid, transform: bobberTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      linearDamping: 3,
      gravityScale: 0.6,
      colliders: {
        ball: createSphereCollider({ radius: BOBBER_RADIUS, restitution: 0.2 }),
      },
    }),
  },
});

// Park the bobber far away until cast
const OFFSCREEN_Y = -100;
bobberTransform.posX.value = 0;
bobberTransform.posY.value = OFFSCREEN_Y;

const {
  x: bobberScreenX,
  y: bobberScreenY,
  isVisible: isBobberVisible,
} = useWorldToScreen({ eid: bobberEid });

// Spring joint between rod tip and bobber
useJoint({
  type: "spring",
  bodyA: rodTipEid,
  bodyB: bobberEid,
  anchorA: { x: 0, y: 0, z: 0 },
  anchorB: { x: 0, y: 0, z: 0 },
  restLength: SPRING_REST_LENGTH,
  stiffness: SPRING_STIFFNESS,
  damping: SPRING_DAMPING,
});

// ─── fish setup ─────────────────────────────────────────────────────────────

interface FishInstance {
  species: FishSpecies;
  startX: number;
  direction: number;
}

const FISH_DATA: Array<FishInstance> = [
  { species: FISH_SPECIES[0], startX: -2, direction: 1 },
  { species: FISH_SPECIES[1], startX: 3, direction: -1 },
  { species: FISH_SPECIES[2], startX: 0, direction: 1 },
  { species: FISH_SPECIES[3], startX: -4, direction: -1 },
  { species: FISH_SPECIES[0], startX: 5, direction: 1 },
  { species: FISH_SPECIES[1], startX: -1, direction: -1 },
];

const fishRefs = ref<Array<InstanceType<typeof Fish> | null>>([]);

// ─── input handling ─────────────────────────────────────────────────────────

useInput({
  map: INPUT_MAP,
  fn: ({ delta, held, pressed }) => {
    // Character movement
    let moveX = 0;
    if (held.left.value === true) {
      moveX = -WALK_SPEED;
    }
    if (held.right.value === true) {
      moveX = WALK_SPEED;
    }

    const currentX = characterTransform.posX.value;
    const nextX = Math.max(DOCK_LEFT, Math.min(DOCK_RIGHT, currentX + moveX * delta));
    characterTransform.posX.value = nextX;

    // Action press
    if (pressed.action.value === true) {
      if (phase.value === "idle") {
        castLine();
      } else if (phase.value === "biting") {
        reelIn();
      }
    }
  },
});

// ─── game actions ───────────────────────────────────────────────────────────

function castLine(): void {
  phase.value = "casting";
  isBobberActive.value = true;
  castTimer.value = CAST_SETTLE_TIME;

  // Position bobber near rod tip, it will fall via gravity + spring
  bobberTransform.posX.value = rodTipTransform.posX.value + CAST_FORWARD_OFFSET;
  bobberTransform.posY.value = rodTipTransform.posY.value;
}

function reelIn(): void {
  if (bitingFishIndex.value !== null) {
    const fishIdx = bitingFishIndex.value;
    const fishData = FISH_DATA[fishIdx];
    if (fishData !== undefined) {
      catches.value = [...catches.value, fishData.species];
    }
  }

  phase.value = "reeling";
  reelTimer.value = REEL_DURATION;
}

function resetLine(): void {
  phase.value = "idle";
  isBobberActive.value = false;
  bitingFishIndex.value = null;

  // Park bobber offscreen
  bobberTransform.posX.value = 0;
  bobberTransform.posY.value = OFFSCREEN_Y;
}

// ─── main game system ───────────────────────────────────────────────────────

useSystem({
  fn: ({ delta }) => {
    // Keep rod tip following character
    rodTipTransform.posX.value = characterTransform.posX.value + ROD_TIP_OFFSET_X;
    rodTipTransform.posY.value = characterTransform.posY.value + ROD_TIP_OFFSET_Y;

    // Handle casting settle timer
    if (phase.value === "casting") {
      castTimer.value = castTimer.value - delta;
      if (castTimer.value <= 0) {
        phase.value = "waiting";
      }
      return;
    }

    // Handle reeling timer
    if (phase.value === "reeling") {
      reelTimer.value = reelTimer.value - delta;
      if (reelTimer.value <= 0) {
        resetLine();
      }
      return;
    }

    // Check for fish bites when waiting
    if (phase.value === "waiting") {
      const bobberX = bobberTransform.posX.value;
      const bobberY = bobberTransform.posY.value;

      for (let i = 0; i < FISH_DATA.length; i++) {
        const fishRef = fishRefs.value[i];
        if (fishRef === null || fishRef === undefined) continue;

        const fishX = fishRef.fishX;
        const fishY = fishRef.fishY;

        const dx = fishX - bobberX;
        const dy = fishY - bobberY;
        const distSq = dx * dx + dy * dy;

        if (distSq < BITE_DISTANCE * BITE_DISTANCE) {
          // Random chance to bite each frame when close
          if (Math.random() < BITE_CHANCE_PER_SECOND * delta) {
            phase.value = "biting";
            bitingFishIndex.value = i;
            break;
          }
        }
      }
    }
  },
});

// ─── derived state ──────────────────────────────────────────────────────────

const isBiting = computed(() => phase.value === "biting");

const statusText = computed(() => {
  switch (phase.value) {
    case "idle":
      return "Press SPACE to cast";
    case "casting":
      return "Casting...";
    case "waiting":
      return "Waiting for a bite...";
    case "biting":
      return "";
    case "reeling":
      return "Caught one!";
    default:
      return "";
  }
});
</script>

<template>
  <Scene name="fishing" :default="true">
    <TresPerspectiveCamera :position="[0, 3, 12]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.8" />

    <!-- Sky background -->
    <TresMesh :position="[0, 8, -10]">
      <TresPlaneGeometry :args="[40, 20]" />
      <TresMeshBasicMaterial color="#87CEEB" />
    </TresMesh>

    <!-- Water surface -->
    <TresMesh :position="[0, WATER_Y, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[20, 10]" />
      <TresMeshStandardMaterial color="#1a6b8a" :opacity="0.7" :transparent="true" />
    </TresMesh>

    <!-- Underwater area (darker) -->
    <TresMesh :position="[0, -2.5, 0]">
      <TresBoxGeometry :args="[20, 4, 10]" />
      <TresMeshStandardMaterial color="#0d3d4d" :opacity="0.5" :transparent="true" />
    </TresMesh>

    <!-- Dock platform (DumasEntity positions group at dockTransform.posY = DOCK_Y) -->
    <DumasEntity :eid="dockEid">
      <TresMesh>
        <TresBoxGeometry
          :args="[DOCK_HALF_LENGTH * 2, DOCK_HALF_HEIGHT * 2, DOCK_HALF_WIDTH * 2]"
        />
        <TresMeshStandardMaterial color="#8B6914" />
      </TresMesh>
    </DumasEntity>

    <!-- Dock posts -->
    <TresMesh :position="[-3, 0.3, -1]">
      <TresBoxGeometry :args="[0.2, 1.6, 0.2]" />
      <TresMeshStandardMaterial color="#6B4F12" />
    </TresMesh>
    <TresMesh :position="[-3, 0.3, 1]">
      <TresBoxGeometry :args="[0.2, 1.6, 0.2]" />
      <TresMeshStandardMaterial color="#6B4F12" />
    </TresMesh>
    <TresMesh :position="[3, 0.3, -1]">
      <TresBoxGeometry :args="[0.2, 1.6, 0.2]" />
      <TresMeshStandardMaterial color="#6B4F12" />
    </TresMesh>
    <TresMesh :position="[3, 0.3, 1]">
      <TresBoxGeometry :args="[0.2, 1.6, 0.2]" />
      <TresMeshStandardMaterial color="#6B4F12" />
    </TresMesh>

    <!-- Character -->
    <DumasEntity :eid="characterEid">
      <TresMesh :position="[0, 0, 0]">
        <TresCylinderGeometry :args="[0.2, 0.25, 0.8, 8]" />
        <TresMeshStandardMaterial color="#5588cc" />
      </TresMesh>
      <TresMesh :position="[0, 0.55, 0]">
        <TresSphereGeometry :args="[0.2, 12, 12]" />
        <TresMeshStandardMaterial color="#ffcc99" />
      </TresMesh>
      <TresMesh :position="[0.4, 0.5, 0]" :rotation="[0, 0, -0.6]">
        <TresCylinderGeometry :args="[0.02, 0.02, 1.2, 6]" />
        <TresMeshStandardMaterial color="#4a3520" />
      </TresMesh>
    </DumasEntity>

    <!-- Bobber (always mounted; parked offscreen when not active) -->
    <DumasEntity v-show="isBobberActive === true" :eid="bobberEid">
      <TresMesh>
        <TresSphereGeometry :args="[BOBBER_RADIUS, 12, 12]" />
        <TresMeshStandardMaterial
          :color="isBiting === true ? '#ff2222' : '#ff4400'"
          :emissive="isBiting === true ? '#ff2222' : '#000000'"
          :emissive-intensity="isBiting === true ? 3 : 0"
        />
      </TresMesh>
      <TresMesh :position="[0, 0.06, 0]">
        <TresSphereGeometry :args="[0.08, 12, 12]" />
        <TresMeshStandardMaterial color="#ffffff" />
      </TresMesh>
    </DumasEntity>

    <!-- Fish -->
    <Fish
      v-for="(fish, index) in FISH_DATA"
      :key="index"
      :ref="
        (el: unknown) => {
          fishRefs[index] = el as InstanceType<typeof Fish> | null;
        }
      "
      :species="fish.species"
      :start-x="fish.startX"
      :direction="fish.direction"
    />

    <template #overlay>
      <!-- Score / HUD -->
      <div class="hud">
        <div class="hud__score">
          Fish caught: <strong>{{ catches.length }}</strong>
        </div>
        <div v-if="catches.length > 0" class="hud__catches">
          <span v-for="(c, i) in catches" :key="i" class="hud__catch" :style="{ color: c.color }">
            {{ c.name }}
          </span>
        </div>
      </div>

      <!-- Status text -->
      <div v-if="statusText.length > 0" class="status">
        {{ statusText }}
      </div>

      <!-- Fish on! indicator near bobber -->
      <div
        v-if="isBiting === true && isBobberVisible === true"
        class="bite-indicator"
        :style="{
          left: bobberScreenX + 'px',
          top: bobberScreenY - 40 + 'px',
        }"
      >
        Fish on! Press SPACE
      </div>

      <!-- Controls hint -->
      <div class="controls">
        <span class="key">A</span>
        <span class="key">D</span> Move
        <span class="key-spacer" />
        <span class="key">Space</span> Cast / Reel
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.hud {
  position: absolute;
  top: 1rem;
  left: 1rem;
  pointer-events: none;
  font-family: monospace;
  color: #fff;
}

.hud__score {
  font-size: 1rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.hud__catches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.4rem;
}

.hud__catch {
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  padding: 0.4rem 1rem;
  border-radius: 6px;
  pointer-events: none;
}

.bite-indicator {
  position: absolute;
  transform: translateX(-50%);
  pointer-events: none;
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: bold;
  color: #ff4444;
  background: rgba(0, 0, 0, 0.75);
  border: 2px solid #ff4444;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  white-space: nowrap;
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: translateX(-50%) scale(1);
  }
  to {
    transform: translateX(-50%) scale(1.1);
  }
}

.controls {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.key {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
}

.key-spacer {
  width: 1rem;
}
</style>
