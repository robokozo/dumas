<script setup lang="ts">
import { ref } from "vue";
import {
  Scene,
  useEcsComponent,
  useSystem,
  defineTag,
  defineInputMap,
  useInput,
  createTriggerZone,
  DumasEntity,
  useGame,
  TRANSFORM_TYPE,
} from "@dumas/core";
import type { TransformStore } from "@dumas/core";

const TRIGGER_RADIUS = 2;
const PLAYER_SPEED = 4;

const isInsideZone = ref(false);

const PlayerTag = defineTag();

const { storeRegistry } = useGame();

// -- Player entity (small cube, WASD-controlled) ----------------------------

const { eid: playerEid } = useEcsComponent({
  components: { player: PlayerTag },
});

const transformStore = storeRegistry.get(TRANSFORM_TYPE) as TransformStore;
transformStore.posX[playerEid].value = -4;
transformStore.posZ[playerEid].value = 0;

// -- Trigger zone entity (marker at origin) ---------------------------------

const { eid: zoneEid } = useEcsComponent({
  components: {
    trigger: createTriggerZone({
      radius: TRIGGER_RADIUS,
      target: [PlayerTag],
      onEnter() {
        isInsideZone.value = true;
      },
      onExit() {
        isInsideZone.value = false;
      },
    }),
  },
});

// -- Keyboard movement (no physics, just transform) -------------------------

const INPUT_MAP = defineInputMap({
  right: ({ keys }) => keys["d"].value === true || keys["ArrowRight"].value === true,
  left: ({ keys }) => keys["a"].value === true || keys["ArrowLeft"].value === true,
  forward: ({ keys }) => keys["w"].value === true || keys["ArrowUp"].value === true,
  backward: ({ keys }) => keys["s"].value === true || keys["ArrowDown"].value === true,
});

useInput({
  map: INPUT_MAP,
  fn({ delta, held }) {
    const vx = (held.right.value === true ? 1 : 0) - (held.left.value === true ? 1 : 0);
    const vz = (held.backward.value === true ? 1 : 0) - (held.forward.value === true ? 1 : 0);

    transformStore.posX[playerEid].value += vx * PLAYER_SPEED * delta;
    transformStore.posZ[playerEid].value += vz * PLAYER_SPEED * delta;
  },
});
</script>

<template>
  <Scene name="trigger-zones-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 10, 10]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.5" />

    <!-- Ground plane -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -0.01, 0]">
      <TresPlaneGeometry :args="[16, 16]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <!-- Trigger zone visual: translucent sphere -->
    <DumasEntity :eid="zoneEid">
      <TresMesh>
        <TresSphereGeometry :args="[TRIGGER_RADIUS, 32, 32]" />
        <TresMeshStandardMaterial
          :color="isInsideZone ? '#44ff44' : '#4488ff'"
          :transparent="true"
          :opacity="isInsideZone ? 0.25 : 0.12"
          :wireframe="false"
        />
      </TresMesh>

      <!-- Zone center marker -->
      <TresMesh>
        <TresSphereGeometry :args="[0.15, 12, 12]" />
        <TresMeshStandardMaterial
          :color="isInsideZone ? '#44ff44' : '#4488ff'"
          :emissive="isInsideZone ? '#44ff44' : '#4488ff'"
          :emissive-intensity="1.5"
        />
      </TresMesh>
    </DumasEntity>

    <!-- Player cube -->
    <DumasEntity :eid="playerEid">
      <TresMesh :position="[0, 0.4, 0]">
        <TresBoxGeometry :args="[0.6, 0.6, 0.6]" />
        <TresMeshStandardMaterial
          :color="isInsideZone ? '#ffdd44' : '#ff6644'"
          :emissive="isInsideZone ? '#ffaa00' : '#441100'"
          :emissive-intensity="isInsideZone ? 1.2 : 0.3"
        />
      </TresMesh>
    </DumasEntity>

    <template #overlay>
      <div class="hud">
        <div :class="['status', { active: isInsideZone }]">
          {{ isInsideZone === true ? "inside zone" : "outside zone" }}
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
