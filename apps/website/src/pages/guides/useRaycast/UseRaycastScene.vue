<script setup lang="ts">
import { ref, shallowRef } from "vue";
import {
  Scene,
  useEcsComponent,
  usePhysics,
  createPhysics,
  createSphereCollider,
  useRaycast,
  useSystem,
  DumasEntity,
} from "@dumas/core";
import { createTransform } from "@dumas/core";

const TWO_PI = Math.PI * 2;
const RAY_SPEED = 0.8;
const TARGET_COUNT = 8;
const ORBIT_RADIUS = 3.5;

// ── Shared hit state ───────────────────────────────────────────────────────────
// Maps eid → whether it is currently being hit this frame
const hitSet = shallowRef(new Set<number>());

usePhysics({ gravity: [0, 0, 0] });

// ── Turret (the ray caster) ────────────────────────────────────────────────────
const { eid: turretEid, transform: turretTransform } = useEcsComponent({
  components: {},
});

// ── Targets ────────────────────────────────────────────────────────────────────
interface Target {
  eid: number;
  angle: number;
}
const targets: Array<Target> = [];

for (let i = 0; i < TARGET_COUNT; i++) {
  const angle = (i / TARGET_COUNT) * TWO_PI;
  const { eid, transform } = useEcsComponent({
    components: {
      physics: createPhysics({
        type: "fixed",
        colliders: {
          body: createSphereCollider({ radius: 0.4 }),
        },
      }),
    },
  });
  transform.posX.value = Math.cos(angle) * ORBIT_RADIUS;
  transform.posY.value = Math.sin(angle) * ORBIT_RADIUS;
  targets.push({ eid, angle });
}

// ── Raycast ────────────────────────────────────────────────────────────────────
const { cast } = useRaycast({ eid: turretEid });

// ── Laser beam endpoints ───────────────────────────────────────────────────────
const laserEnd = ref<[number, number, number]>([5, 0, 0]);
const rayAngle = ref(0);

useSystem({
  components: [createTransform],
  fn: ({ delta, elapsed }) => {
    rayAngle.value = elapsed * RAY_SPEED;

    const dir = {
      x: Math.cos(rayAngle.value),
      y: Math.sin(rayAngle.value),
      z: 0,
    };

    const hit = cast({ origin: { x: 0, y: 0, z: 0 }, direction: dir, maxDistance: 8 });

    const newHits = new Set<number>();
    if (hit !== null) {
      newHits.add(hit.targetEid);
      laserEnd.value = [hit.point.x, hit.point.y, hit.point.z];
    } else {
      laserEnd.value = [dir.x * 8, dir.y * 8, 0];
    }
    hitSet.value = newHits;
  },
});
</script>

<template>
  <Scene name="raycast-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 0, 14]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.5" />

    <!-- Turret -->
    <TresMesh :position="[0, 0, 0]">
      <TresSphereGeometry :args="[0.25, 12, 12]" />
      <TresMeshStandardMaterial color="#ffffff" :emissive="'#ff4400'" :emissive-intensity="1" />
    </TresMesh>

    <!-- Laser beam — drawn as a thin emissive cylinder along the ray -->
    <TresMesh
      :position="[laserEnd[0] / 2, laserEnd[1] / 2, 0]"
      :rotation="[0, 0, Math.atan2(laserEnd[1], laserEnd[0]) - Math.PI / 2]"
    >
      <TresCylinderGeometry
        :args="[0.03, 0.03, Math.sqrt(laserEnd[0] ** 2 + laserEnd[1] ** 2), 4]"
      />
      <TresMeshStandardMaterial color="#ff4400" :emissive="'#ff4400'" :emissive-intensity="2" />
    </TresMesh>

    <!-- Targets -->
    <DumasEntity v-for="t in targets" :key="t.eid" :eid="t.eid">
      <TresMesh>
        <TresSphereGeometry :args="[0.4, 12, 12]" />
        <TresMeshStandardMaterial
          :color="hitSet.has(t.eid) ? '#ff4400' : '#334455'"
          :emissive="hitSet.has(t.eid) ? '#ff2200' : '#000000'"
          :emissive-intensity="hitSet.has(t.eid) ? 1.5 : 0"
        />
      </TresMesh>
    </DumasEntity>
  </Scene>
</template>
