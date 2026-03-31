<script setup lang="ts">
import { ref, shallowRef } from "vue";
import {
  Scene,
  useEcsComponent,
  usePhysics,
  useSystem,
  createPhysics,
  createCuboidCollider,
  defineInputMap,
  useInput,
} from "@dumas/core";
import type { MarbleState } from "./types";
import {
  GRAVITY_Y,
  MAX_MARBLES,
  START_PLATFORM_X,
  START_PLATFORM_Y,
  START_PLATFORM_Z,
  RAMPS,
  GOAL_X,
  GOAL_Y,
  GOAL_Z,
  GOAL_COLOR,
  WALL_COLOR,
  CHECKPOINT_POINTS,
  GOAL_POINTS,
} from "./constants";
import Marble from "./Marble.vue";
import Ramp from "./Ramp.vue";
import Seesaw from "./Seesaw.vue";
import SpringBumper from "./SpringBumper.vue";
import Checkpoint from "./Checkpoint.vue";
import MarbleRunUI from "./MarbleRunUI.vue";

// ── Physics world ────────────────────────────────────────────────────────────
usePhysics({ gravity: [0, GRAVITY_Y, 0] });

// ── Game state ───────────────────────────────────────────────────────────────
const score = ref(0);
const elapsedTime = ref(0);
let isTimerRunning = false;
let nextMarbleId = 0;
const marbles = shallowRef<Array<MarbleState>>([]);

// ── Checkpoint data ──────────────────────────────────────────────────────────
const CHECKPOINT_CONFIGS = [
  { id: 0, label: "CP 1", x: -1.5, y: 7.5, z: 0 },
  { id: 1, label: "CP 2", x: 1.5, y: 4.5, z: 0 },
  { id: 2, label: "CP 3", x: -1.5, y: 2.0, z: 0 },
] as const;

// Template refs for checkpoints to access their exposed screen positions
const checkpointRefs = ref<Array<InstanceType<typeof Checkpoint> | null>>([]);

interface CheckpointDisplay {
  label: string;
  screenX: number;
  screenY: number;
  isVisible: boolean;
  isReached: boolean;
}

const checkpointDisplays = shallowRef<Array<CheckpointDisplay>>([]);

function updateCheckpointDisplays(): void {
  const displays: Array<CheckpointDisplay> = [];
  for (const cpRef of checkpointRefs.value) {
    if (cpRef !== null && cpRef !== undefined) {
      displays.push({
        label: cpRef.label,
        screenX: cpRef.screenX,
        screenY: cpRef.screenY,
        isVisible: cpRef.isVisible,
        isReached: cpRef.isReached,
      });
    }
  }
  checkpointDisplays.value = displays;
}

// ── Start platform (fixed) ───────────────────────────────────────────────────
const { transform: startPlatformTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        platform: createCuboidCollider({
          halfExtents: [1.5, 0.15, 1.2],
          friction: 0.3,
        }),
      },
    }),
  },
});
startPlatformTransform.posX.value = START_PLATFORM_X;
startPlatformTransform.posY.value = START_PLATFORM_Y;
startPlatformTransform.posZ.value = START_PLATFORM_Z;

// ── Side walls — keep marbles from flying off sideways ───────────────────────
const SIDE_WALL_HALF_HEIGHT = 7;
const SIDE_WALL_Y = 4;
const SIDE_WALL_X_OFFSET = 6;

const { transform: leftWallTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [0.1, SIDE_WALL_HALF_HEIGHT, 1.5] }),
      },
    }),
  },
});
leftWallTransform.posX.value = -SIDE_WALL_X_OFFSET;
leftWallTransform.posY.value = SIDE_WALL_Y;
leftWallTransform.posZ.value = 0;

const { transform: rightWallTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [0.1, SIDE_WALL_HALF_HEIGHT, 1.5] }),
      },
    }),
  },
});
rightWallTransform.posX.value = SIDE_WALL_X_OFFSET;
rightWallTransform.posY.value = SIDE_WALL_Y;
rightWallTransform.posZ.value = 0;

// ── Goal funnel walls — angled walls that guide marble into the goal ─────────
const FUNNEL_WALL_HALF = 2.0;
const FUNNEL_ANGLE = 0.4;

const { transform: funnelLeftTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [FUNNEL_WALL_HALF, 0.1, 1.2], friction: 0.2 }),
      },
    }),
  },
});
funnelLeftTransform.posX.value = GOAL_X - 1.8;
funnelLeftTransform.posY.value = GOAL_Y + 0.5;
funnelLeftTransform.posZ.value = GOAL_Z;
funnelLeftTransform.setEuler({ z: -FUNNEL_ANGLE });

const { transform: funnelRightTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [FUNNEL_WALL_HALF, 0.1, 1.2], friction: 0.2 }),
      },
    }),
  },
});
funnelRightTransform.posX.value = GOAL_X + 1.8;
funnelRightTransform.posY.value = GOAL_Y + 0.5;
funnelRightTransform.posZ.value = GOAL_Z;
funnelRightTransform.setEuler({ z: FUNNEL_ANGLE });

// ── Input ────────────────────────────────────────────────────────────────────
const DROP_COOLDOWN_DURATION = 0.6;
let dropCooldown = 0;

const INPUT_MAP = defineInputMap({
  drop: ({ keys }) => keys["space"]?.value === true,
});

useInput({
  map: INPUT_MAP,
  fn: ({ delta, pressed }) => {
    if (dropCooldown > 0) {
      dropCooldown = Math.max(0, dropCooldown - delta);
    }

    if (pressed.drop.value === true && dropCooldown === 0) {
      spawnMarble();
      dropCooldown = DROP_COOLDOWN_DURATION;
    }
  },
});

// ── Timer system ─────────────────────────────────────────────────────────────
useSystem({
  components: [],
  fn: ({ delta }) => {
    if (isTimerRunning === true) {
      elapsedTime.value += delta;
    }

    // Update checkpoint displays each frame (template refs may become available after mount)
    updateCheckpointDisplays();
  },
});

// ── Marble management ────────────────────────────────────────────────────────
function spawnMarble(): void {
  if (marbles.value.length >= MAX_MARBLES) {
    return;
  }

  // Start timer on first marble
  if (isTimerRunning === false) {
    isTimerRunning = true;
  }

  const jitterX = (Math.random() - 0.5) * 0.5;
  const marble: MarbleState = {
    id: nextMarbleId++,
    startX: START_PLATFORM_X + jitterX,
    startY: START_PLATFORM_Y + 1.5,
    startZ: START_PLATFORM_Z,
  };

  marbles.value = [...marbles.value, marble];
}

function onMarbleFell({ id }: { id: number }): void {
  score.value += GOAL_POINTS;
  marbles.value = marbles.value.filter((m) => m.id !== id);
}

function onCheckpointReached(): void {
  score.value += CHECKPOINT_POINTS;
}
</script>

<template>
  <Scene name="marble-run" :default="true">
    <TresPerspectiveCamera :position="[0, 5, 18]" :look-at="[0, 4, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.35" />
    <TresDirectionalLight :position="[5, 12, 8]" :intensity="1.8" color="#fff8ee" />
    <TresDirectionalLight :position="[-4, 8, -3]" :intensity="0.5" color="#aaccff" />
    <TresPointLight :position="[0, 10, 4]" :intensity="25" :distance="18" color="#ffdd88" />

    <!-- Background panel -->
    <TresMesh :position="[0, 4, -2]">
      <TresPlaneGeometry :args="[16, 16]" />
      <TresMeshStandardMaterial color="#1a1a2e" />
    </TresMesh>

    <!-- Start platform visual -->
    <TresMesh :position="[START_PLATFORM_X, START_PLATFORM_Y, START_PLATFORM_Z]">
      <TresBoxGeometry :args="[3, 0.3, 2.4]" />
      <TresMeshStandardMaterial color="#3a7d44" :emissive="'#2a5d34'" :emissive-intensity="0.3" />
    </TresMesh>

    <!-- Ramps -->
    <Ramp
      v-for="(ramp, i) in RAMPS"
      :key="'ramp-' + i"
      :x="ramp.x"
      :y="ramp.y"
      :z="ramp.z"
      :half-width="ramp.halfWidth"
      :half-height="ramp.halfHeight"
      :half-depth="ramp.halfDepth"
      :angle="ramp.angle"
      :color="ramp.color"
    />

    <!-- Seesaw -->
    <Seesaw />

    <!-- Spring bumper -->
    <SpringBumper />

    <!-- Side wall visuals -->
    <TresMesh :position="[-SIDE_WALL_X_OFFSET, SIDE_WALL_Y, 0]">
      <TresBoxGeometry :args="[0.2, SIDE_WALL_HALF_HEIGHT * 2, 3]" />
      <TresMeshStandardMaterial :color="WALL_COLOR" />
    </TresMesh>
    <TresMesh :position="[SIDE_WALL_X_OFFSET, SIDE_WALL_Y, 0]">
      <TresBoxGeometry :args="[0.2, SIDE_WALL_HALF_HEIGHT * 2, 3]" />
      <TresMeshStandardMaterial :color="WALL_COLOR" />
    </TresMesh>

    <!-- Goal funnel visuals -->
    <TresMesh :position="[GOAL_X - 1.8, GOAL_Y + 0.5, GOAL_Z]" :rotation="[0, 0, -FUNNEL_ANGLE]">
      <TresBoxGeometry :args="[FUNNEL_WALL_HALF * 2, 0.2, 2.4]" />
      <TresMeshStandardMaterial
        :color="GOAL_COLOR"
        :emissive="GOAL_COLOR"
        :emissive-intensity="0.2"
      />
    </TresMesh>
    <TresMesh :position="[GOAL_X + 1.8, GOAL_Y + 0.5, GOAL_Z]" :rotation="[0, 0, FUNNEL_ANGLE]">
      <TresBoxGeometry :args="[FUNNEL_WALL_HALF * 2, 0.2, 2.4]" />
      <TresMeshStandardMaterial
        :color="GOAL_COLOR"
        :emissive="GOAL_COLOR"
        :emissive-intensity="0.2"
      />
    </TresMesh>

    <!-- Goal marker -->
    <TresMesh :position="[GOAL_X, GOAL_Y - 0.5, GOAL_Z]">
      <TresBoxGeometry :args="[1.5, 0.15, 2.4]" />
      <TresMeshStandardMaterial
        :color="GOAL_COLOR"
        :emissive="GOAL_COLOR"
        :emissive-intensity="0.5"
        :transparent="true"
        :opacity="0.6"
      />
    </TresMesh>

    <!-- Checkpoints -->
    <Checkpoint
      v-for="(cp, i) in CHECKPOINT_CONFIGS"
      :key="cp.id"
      :ref="
        (el: any) => {
          checkpointRefs[i] = el;
        }
      "
      :x="cp.x"
      :y="cp.y"
      :z="cp.z"
      :label="cp.label"
      @reached="() => onCheckpointReached()"
    />

    <!-- Marbles -->
    <Marble
      v-for="m in marbles"
      :key="m.id"
      :start-x="m.startX"
      :start-y="m.startY"
      :start-z="m.startZ"
      :color-index="m.id"
      @fell="() => onMarbleFell({ id: m.id })"
    />

    <template #overlay>
      <MarbleRunUI
        :score="score"
        :elapsed-time="elapsedTime"
        :marble-count="marbles.length"
        :max-marbles="MAX_MARBLES"
        :checkpoints="checkpointDisplays"
      />
    </template>
  </Scene>
</template>
