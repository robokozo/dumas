<script setup lang="ts">
import {
  Scene,
  useEcsComponent,
  usePhysics,
  createPhysics,
  createCuboidCollider,
  createSphereCollider,
  defineCollisionGroups,
  DumasEntity,
} from "@dumas/core";

// ── Groups ─────────────────────────────────────────────────────────────────────
const Groups = defineCollisionGroups(["red", "blue", "green"]);

// Red balls only land on red platform.
// Blue balls only land on blue platform.
// Green balls land on both — member of both groups, filter all.

usePhysics({ gravity: [0, -9.81, 0] });

// ── Platforms ──────────────────────────────────────────────────────────────────
// Red platform — only red balls land here.
const { transform: redPlatform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        slab: createCuboidCollider({
          halfExtents: [2, 0.15, 1],
          membership: Groups.red,
          filter: Groups.red | Groups.green,
        }),
      },
    }),
  },
});
redPlatform.posX.value = -2.5;
redPlatform.posY.value = -1.5;

// Blue platform — only blue balls land here.
const { transform: bluePlatform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        slab: createCuboidCollider({
          halfExtents: [2, 0.15, 1],
          membership: Groups.blue,
          filter: Groups.blue | Groups.green,
        }),
      },
    }),
  },
});
bluePlatform.posX.value = 2.5;
bluePlatform.posY.value = -1.5;

// Ground — everything lands here eventually.
const { transform: ground } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        floor: createCuboidCollider({
          halfExtents: [8, 0.15, 1],
          membership: Groups.red | Groups.blue | Groups.green,
          filter: Groups.red | Groups.blue | Groups.green,
        }),
      },
    }),
  },
});
ground.posY.value = -4;

// ── Balls ──────────────────────────────────────────────────────────────────────
interface Ball {
  posX: number;
  posY: number;
  color: string;
  membership: number;
  filter: number;
}

// 6 balls: one of each color above each platform.
// Above the RED platform: red lands, blue and green pass through (blue) or land (green).
// Above the BLUE platform: blue lands, red and green pass through (red) or land (green).
// Red above blue platform passes through → lands on ground.
// Blue above red platform passes through → lands on ground.
// Green above either platform lands on it.
const BALLS: Array<Ball> = [
  // --- above RED platform (x ≈ -2.5) ---
  {
    posX: -3.8,
    posY: 5,
    color: "#ff4444",
    membership: Groups.red,
    filter: Groups.red | Groups.green,
  },
  {
    posX: -2.5,
    posY: 7,
    color: "#4488ff",
    membership: Groups.blue,
    filter: Groups.blue | Groups.green,
  },
  {
    posX: -1.2,
    posY: 5,
    color: "#44cc44",
    membership: Groups.green,
    filter: Groups.red | Groups.blue | Groups.green,
  },
  // --- above BLUE platform (x ≈ +2.5) ---
  {
    posX: 1.2,
    posY: 5,
    color: "#ff4444",
    membership: Groups.red,
    filter: Groups.red | Groups.green,
  },
  {
    posX: 2.5,
    posY: 7,
    color: "#4488ff",
    membership: Groups.blue,
    filter: Groups.blue | Groups.green,
  },
  {
    posX: 3.8,
    posY: 5,
    color: "#44cc44",
    membership: Groups.green,
    filter: Groups.red | Groups.blue | Groups.green,
  },
];

interface BallEntity {
  eid: number;
  posX: number;
  posY: number;
  color: string;
}

const ballEntities: Array<BallEntity> = BALLS.map(({ posX, posY, color, membership, filter }) => {
  const { eid, transform } = useEcsComponent({
    components: {
      physics: createPhysics({
        type: "dynamic",
        colliders: {
          shell: createSphereCollider({ radius: 0.35, restitution: 0.4, membership, filter }),
        },
      }),
    },
  });
  transform.posX.value = posX;
  transform.posY.value = posY;
  return { eid, posX, posY, color };
});
</script>

<template>
  <Scene name="groups-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 3, 16]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[3, 8, 5]" :intensity="1.8" />

    <!-- Red platform -->
    <TresMesh :position="[-2.5, -1.5, 0]">
      <TresBoxGeometry :args="[4, 0.3, 2]" />
      <TresMeshStandardMaterial color="#6b1a1a" />
    </TresMesh>

    <!-- Blue platform -->
    <TresMesh :position="[2.5, -1.5, 0]">
      <TresBoxGeometry :args="[4, 0.3, 2]" />
      <TresMeshStandardMaterial color="#1a2d6b" />
    </TresMesh>

    <!-- Ground -->
    <TresMesh :position="[0, -4, 0]">
      <TresBoxGeometry :args="[16, 0.3, 2]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <!-- Ball entities -->
    <DumasEntity v-for="ball in ballEntities" :key="ball.eid" :eid="ball.eid">
      <TresMesh>
        <TresSphereGeometry :args="[0.35, 12, 12]" />
        <TresMeshStandardMaterial :color="ball.color" />
      </TresMesh>
    </DumasEntity>

    <template #overlay>
      <div class="legend">
        <span class="dot red" />Red balls → red platform <span class="dot blue" />Blue balls → blue
        platform <span class="dot green" />Green balls → both
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.legend {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-family: sans-serif;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  pointer-events: none;
}
.dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-right: 0.4rem;
  vertical-align: middle;
}
.dot.red {
  background: #ff4444;
}
.dot.blue {
  background: #4488ff;
}
.dot.green {
  background: #44cc44;
}
</style>
