<script setup lang="ts">
import { Scene, ObjectPool, defineInputMap, useInput, usePool, createTransform } from "@dumas/core";

const INPUT_MAP = defineInputMap({
  fire: ({ keys, gamepad }) =>
    keys.space?.value === true || gamepad.value?.buttons[0]?.pressed === true,
});

const POOL_SIZE = 8;
const GRAVITY = -12;
const LAUNCH_SPEED = 7;
const SPREAD = 3;

const pool = usePool({ size: POOL_SIZE, components: { transform: createTransform } });

// Per-projectile velocity tracked outside ECS — no need for a full component
const velocities = new Map<number, { vx: number; vy: number }>();

useInput({
  map: INPUT_MAP,
  fn: ({ delta, pressed }) => {
    if (pressed.fire.value === true) {
      const eid = pool.acquire();
      if (eid !== null) {
        pool.stores.transform.posX[eid].value = 0;
        pool.stores.transform.posY[eid].value = 0.3;
        pool.stores.transform.posZ[eid].value = 0;
        velocities.set(eid, {
          vx: (Math.random() - 0.5) * SPREAD,
          vy: LAUNCH_SPEED,
        });
      }
    }

    for (const slot of pool.slots) {
      if (slot.isActive.value === false) continue;

      const v = velocities.get(slot.eid);
      if (v === undefined) continue;

      pool.stores.transform.posX[slot.eid].value += v.vx * delta;
      pool.stores.transform.posY[slot.eid].value += v.vy * delta;
      v.vy += GRAVITY * delta;

      if (pool.stores.transform.posY[slot.eid].value < -0.2) {
        pool.release({ eid: slot.eid });
        velocities.delete(slot.eid);
      }
    }
  },
});
</script>

<template>
  <Scene name="demo" :default="true">
    <TresPerspectiveCamera :position="[0, 3, 10]" :look-at="[0, 1, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.7" />
    <TresDirectionalLight :position="[4, 8, 4]" :intensity="2" />

    <!-- Ground -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[12, 8]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <!-- Launcher -->
    <TresMesh :position="[0, 0.2, 0]">
      <TresCylinderGeometry :args="[0.15, 0.25, 0.4, 12]" />
      <TresMeshStandardMaterial color="#556677" />
    </TresMesh>

    <!-- Pooled projectiles -->
    <ObjectPool :pool="pool" v-slot="{ transform }">
      <TresMesh :position="[transform.posX.value, transform.posY.value, transform.posZ.value]">
        <TresSphereGeometry :args="[0.18, 10, 10]" />
        <TresMeshStandardMaterial color="#ff6644" emissive="#ff2200" :emissive-intensity="0.4" />
      </TresMesh>
    </ObjectPool>

    <template #overlay>
      <div class="hud">
        <div class="hud__row">
          <span class="pill">Space to fire</span>
        </div>
        <div class="hud__row">
          <span class="badge"
            >Slots: {{ pool.slots.filter((s) => s.isActive.value === true).length }} /
            {{ POOL_SIZE }}</span
          >
        </div>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.hud {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  pointer-events: none;
}

.hud__row {
  display: flex;
  gap: 0.4rem;
}

.pill {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.35);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
}

.badge {
  font-family: monospace;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 160, 60, 0.5);
  color: rgba(255, 160, 60, 0.9);
  background: rgba(255, 160, 60, 0.1);
}
</style>
