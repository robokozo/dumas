<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { RigidBody, useCollision } from "@dumas/core";

const RED_COLOR = "#ff4444";
const BLUE_COLOR = "#4488ff";

const ballRef = shallowRef<InstanceType<typeof RigidBody> | null>(null);
const ballColor = shallowRef(RED_COLOR);

// Derived from the RigidBody's auto-created collider once it mounts.
const ballCollider = computed(() => ballRef.value?.context?.colliders?.[0]?.collider ?? null);

useCollision({
  collider: ballCollider,
  onContact({ other }) {
    const wallX = other.translation().x;
    ballColor.value = wallX < 0 ? RED_COLOR : BLUE_COLOR;
  },
});
</script>

<template>
  <RigidBody
    ref="ballRef"
    type="dynamic"
    collider="ball"
    :gravity-scale="0"
    :restitution="1"
    :friction="0"
    :linear-damping="0"
    :lock-rotations="true"
    :enabled-translations="[true, false, false]"
    :linvel="{ x: 6, y: 0, z: 0 }"
  >
    <TresMesh>
      <TresSphereGeometry :args="[0.5, 32, 32]" />
      <TresMeshStandardMaterial
        :color="ballColor"
        :emissive="ballColor"
        :emissive-intensity="0.5"
      />
    </TresMesh>
  </RigidBody>
</template>
