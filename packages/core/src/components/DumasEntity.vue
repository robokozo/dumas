<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { Group } from "three";
import { useGame } from "../world/useGame";
import { TRANSFORM_TYPE } from "../ecs/components";
import type { TransformStore } from "../ecs/components";

const props = defineProps<{ eid: number }>();

const { registerSystem, storeRegistry } = useGame();

// Created imperatively so the group reference is stable before mount.
// The system writes position/quaternion/scale directly — no Vue reactivity
// lag between the physics sync writing to TransformStore and Three.js rendering.
const group = new Group();

let off: (() => void) | null = null;

onMounted(() => {
  off = registerSystem({
    // Runs after physics sync (priority 0) so transform values are already
    // updated for this frame before we copy them to the Three.js group.
    priority: 100,
    fn: () => {
      const tStore = storeRegistry.get(TRANSFORM_TYPE) as TransformStore | undefined;
      if (tStore === undefined) return;

      const posX = tStore.posX[props.eid];
      if (posX === undefined) return;

      group.position.set(posX.value, tStore.posY[props.eid].value, tStore.posZ[props.eid].value);
      group.quaternion.set(
        tStore.rotX[props.eid].value,
        tStore.rotY[props.eid].value,
        tStore.rotZ[props.eid].value,
        tStore.rotW[props.eid].value,
      );
      group.scale.set(
        tStore.scaleX[props.eid].value,
        tStore.scaleY[props.eid].value,
        tStore.scaleZ[props.eid].value,
      );
    },
  });
});

onUnmounted(() => {
  off?.();
});
</script>

<template>
  <!--
    primitive wraps the imperatively-created Group so TresJS adds it to the
    scene and handles child Three.js objects (meshes, lights, etc.) through
    the slot. Position is driven by the system above, not Vue reactivity.
  -->
  <primitive :object="group">
    <slot />
  </primitive>
</template>
