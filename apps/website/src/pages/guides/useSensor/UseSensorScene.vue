<script setup lang="ts">
import { ref } from "vue";
import {
  Scene,
  useEcsComponent,
  usePhysics,
  createPhysics,
  createCuboidCollider,
  createSphereCollider,
  useSensor,
  useGame,
  defineInputMap,
  useInput,
  PHYSICS_TYPE,
  DumasEntity,
} from "@dumas/core";
import type { PhysicsStore } from "@dumas/core";

const ZONE_HALF = 1.5;
const BALL_SPEED = 7;

const isInZone = ref(false);

usePhysics({ gravity: [0, 0, 0] });

// ── Ball ───────────────────────────────────────────────────────────────────────
const { eid: ballEid, transform: ballTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      gravityScale: 0,
      linearDamping: 8,
      lockRotations: true,
      enabledTranslations: [true, true, false],
      colliders: {
        shell: createSphereCollider({ radius: 0.45, restitution: 0, friction: 0 }),
      },
    }),
  },
});
ballTransform.posX.value = -4;

// ── Zone sensor ────────────────────────────────────────────────────────────────
const { eid: zoneEid } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        zone: createCuboidCollider({
          halfExtents: [ZONE_HALF, ZONE_HALF, ZONE_HALF],
          sensor: true,
        }),
      },
    }),
  },
});

useSensor({
  eid: zoneEid,
  collider: "zone",
  onEnter() {
    isInZone.value = true;
  },
  onExit() {
    isInZone.value = false;
  },
});

// ── Keyboard movement ──────────────────────────────────────────────────────────
const gameCtx = useGame();

const INPUT_MAP = defineInputMap({
  right: ({ keys }) => keys["ArrowRight"].value || keys["d"].value,
  left: ({ keys }) => keys["ArrowLeft"].value || keys["a"].value,
  up: ({ keys }) => keys["ArrowUp"].value || keys["w"].value,
  down: ({ keys }) => keys["ArrowDown"].value || keys["s"].value,
});

useInput({
  map: INPUT_MAP,
  fn({ held }) {
    const store = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
    if (store === undefined) return;
    const body = store.body[ballEid];
    if (body === undefined) return;
    const vx = (held.right.value === true ? 1 : 0) - (held.left.value === true ? 1 : 0);
    const vy = (held.up.value === true ? 1 : 0) - (held.down.value === true ? 1 : 0);
    body.setLinvel({ x: vx * BALL_SPEED, y: vy * BALL_SPEED, z: 0 }, true);
  },
});
</script>

<template>
  <Scene name="sensor-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 0, 16]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.6" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.5" />

    <!-- Zone visual -->
    <TresMesh>
      <TresBoxGeometry :args="[ZONE_HALF * 2, ZONE_HALF * 2, ZONE_HALF * 2]" />
      <TresMeshStandardMaterial
        :color="isInZone ? '#1a4d1a' : '#1a2a1a'"
        :transparent="true"
        :opacity="0.5"
      />
    </TresMesh>
    <!-- Zone border wireframe -->
    <TresMesh>
      <TresBoxGeometry :args="[ZONE_HALF * 2, ZONE_HALF * 2, ZONE_HALF * 2]" />
      <TresMeshStandardMaterial :color="isInZone ? '#44ff44' : '#224422'" :wireframe="true" />
    </TresMesh>

    <!-- Ball -->
    <DumasEntity :eid="ballEid">
      <TresMesh>
        <TresSphereGeometry :args="[0.45, 16, 16]" />
        <TresMeshStandardMaterial
          :color="isInZone ? '#ffdd44' : '#ff6644'"
          :emissive="isInZone ? '#ffaa00' : '#441100'"
          :emissive-intensity="isInZone ? 1.2 : 0.3"
        />
      </TresMesh>
    </DumasEntity>

    <template #overlay>
      <div class="hud">
        <div :class="['status', { active: isInZone }]">
          {{ isInZone ? "in zone" : "outside zone" }}
        </div>
        <div class="controls">WASD / arrows to move</div>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.hud {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  font-family: sans-serif;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
}
.status {
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.15s;
}
.status.active {
  color: #44ff44;
}
.controls {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.2);
}
</style>
