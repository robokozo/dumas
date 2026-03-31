<script setup lang="ts">
import { shallowRef } from "vue";
import { Scene, useEcsComponent, useWorldToScreen, useSystem } from "@dumas/core";
import { TRANSFORM_TYPE } from "@dumas/core";
import type { TransformStore } from "@dumas/core";

const ENTITIES = [
  { name: "Alpha", color: "#ff6b6b", x: -3, speed: 1.2 },
  { name: "Beta", color: "#4ecdc4", x: 0, speed: 0.8 },
  { name: "Gamma", color: "#ffe66d", x: 3, speed: 1.6 },
] as const;

// Create entities and attach useWorldToScreen to each one.
const tracked = ENTITIES.map(({ name, color, x, speed }) => {
  const { eid, transform } = useEcsComponent({ components: {} });

  transform.posX.value = x;
  transform.posY.value = 0;

  const { x: screenX, y: screenY, isVisible } = useWorldToScreen({ eid });

  return { name, color, x, speed, eid, transform, screenX, screenY, isVisible };
});

// Bob each entity up and down at its own speed.
useSystem({
  components: [],
  fn: ({ elapsed }) => {
    for (const entity of tracked) {
      entity.transform.posY.value = Math.sin(elapsed * entity.speed) * 1.5;
    }
  },
});
</script>

<template>
  <Scene name="demo" :default="true">
    <TresPerspectiveCamera :position="[0, 2, 10]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.6" />
    <TresDirectionalLight :position="[4, 8, 4]" :intensity="2" />

    <!-- Ground plane -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -2, 0]">
      <TresPlaneGeometry :args="[14, 6]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <!-- Spheres -->
    <TresMesh
      v-for="entity in tracked"
      :key="entity.eid"
      :position="[entity.x, entity.transform.posY.value, 0]"
    >
      <TresSphereGeometry :args="[0.5, 24, 24]" />
      <TresMeshStandardMaterial
        :color="entity.color"
        :emissive="entity.color"
        :emissive-intensity="0.3"
      />
    </TresMesh>

    <template #overlay>
      <div
        v-for="entity in tracked"
        :key="entity.eid"
        v-show="entity.isVisible.value === true"
        class="label"
        :style="{
          left: entity.screenX.value + 'px',
          top: entity.screenY.value - 30 + 'px',
        }"
      >
        {{ entity.name }}
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.label {
  position: absolute;
  transform: translateX(-50%);
  pointer-events: none;
  font-family: monospace;
  font-size: 0.75rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}
</style>
