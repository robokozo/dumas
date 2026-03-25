<script setup lang="ts">
import { watch } from "vue";
import { GameObject, RigidBody, Collider, useObjectPool, useSystem } from "@dumas/core";
import { OrbitControls } from "@tresjs/cientos";
import PoolBall from "./PoolBall.vue";

const props = defineProps<{ spawnCount: number }>();
const emit = defineEmits<{ "pool-update": [{ available: number; active: number }] }>();

const RELEASE_THRESHOLD = -10;

const { handles, available, active, acquire, release } = useObjectPool({
  size: 5,
  bodyType: "dynamic",
  colliderOptions: {
    shape: "sphere",
    radius: 0.4,
    restitution: 0.5,
  },
});

watch(
  () => props.spawnCount,
  () => {
    const handle = acquire();
    if (handle === null) {
      return;
    }
    const offsetX = (Math.random() - 0.5) * 2;
    handle.rigidBody.setTranslation({ x: offsetX, y: 6, z: 0 }, true);
    handle.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    emit("pool-update", { available: available.value, active: active.value });
  },
);

useSystem({
  fn: () => {
    for (const handle of handles.value) {
      if (handle.isActive === false) {
        continue;
      }
      const pos = handle.rigidBody.translation();
      if (pos.y < RELEASE_THRESHOLD) {
        release({ eid: handle.eid });
        emit("pool-update", { available: available.value, active: active.value });
      }
    }
  },
});
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 5, 16]" :look-at="[0, 2, 0]" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1" />

    <PoolBall v-for="handle in handles" :key="handle.eid" :handle="handle" />

    <GameObject :position="{ x: 0, y: -0.25, z: 0 }">
      <RigidBody type="fixed">
        <Collider shape="box" :args="[1.5, 0.25, 1.5]" />
      </RigidBody>
      <TresMesh>
        <TresBoxGeometry :args="[3, 0.5, 3]" />
        <TresMeshStandardMaterial color="#555" />
      </TresMesh>
    </GameObject>
  </GameObject>
</template>
