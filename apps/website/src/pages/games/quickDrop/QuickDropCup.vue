<script setup lang="ts">
import {
  DumasEntity,
  useEcsComponent,
  createPhysics,
  createCuboidCollider,
  createCylinderCollider,
} from "@dumas/core";
import type { ColliderConfig } from "@dumas/core";

const props = defineProps<{
  cupRadius: number;
  wallHeight: number;
  color: string;
}>();

const emit = defineEmits<{
  registered: [{ eid: number }];
}>();

const WALL_THICKNESS = 0.04;
const SIDES = 8;

// Build 8 wall colliders forming an octagon + a floor
const apothem = props.cupRadius * Math.cos(Math.PI / SIDES);
const wallHalfWidth = props.cupRadius * Math.sin(Math.PI / SIDES);
const wallHalfHeight = props.wallHeight / 2;

const colliders: Record<string, ColliderConfig> = {
  floor: createCylinderCollider({
    halfHeight: 0.02,
    radius: apothem,
    friction: 0.8,
  }),
};

for (let i = 0; i < SIDES; i++) {
  const angle = (i / SIDES) * Math.PI * 2 + Math.PI / SIDES;
  colliders[`wall${i}`] = createCuboidCollider({
    halfExtents: [wallHalfWidth, wallHalfHeight, WALL_THICKNESS / 2],
    offset: [Math.cos(angle) * apothem, wallHalfHeight + 0.02, Math.sin(angle) * apothem],
    offsetRotation: yQuat(angle),
    restitution: 0.2,
  });
}

const createCupBody = createPhysics({
  type: "kinematicPositionBased",
  colliders,
});

const { eid } = useEcsComponent({
  components: { physics: createCupBody },
});

emit("registered", { eid });

function yQuat(angle: number): [number, number, number, number] {
  const half = (angle + Math.PI / 2) / 2;
  return [0, Math.sin(half), 0, Math.cos(half)];
}
</script>

<template>
  <DumasEntity :eid="eid">
    <!-- Floor disc -->
    <TresMesh>
      <TresCylinderGeometry :args="[apothem, apothem, 0.04, SIDES]" />
      <TresMeshStandardMaterial :color="props.color" />
    </TresMesh>

    <!-- 8 walls forming the octagon -->
    <TresMesh
      v-for="i in SIDES"
      :key="i"
      :position="[
        Math.cos(((i - 1) / SIDES) * Math.PI * 2 + Math.PI / SIDES) * apothem,
        wallHalfHeight + 0.02,
        Math.sin(((i - 1) / SIDES) * Math.PI * 2 + Math.PI / SIDES) * apothem,
      ]"
      :rotation="[0, -(((i - 1) / SIDES) * Math.PI * 2 + Math.PI / SIDES + Math.PI / 2), 0]"
    >
      <TresBoxGeometry :args="[wallHalfWidth * 2, props.wallHeight, WALL_THICKNESS]" />
      <TresMeshStandardMaterial color="#555566" :transparent="true" :opacity="0.6" />
    </TresMesh>
  </DumasEntity>
</template>
