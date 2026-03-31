<script setup lang="ts">
import { DumasEntity, useEcsComponent, createPhysics, createCuboidCollider } from "@dumas/core";

const props = defineProps<{
  x: number;
  y: number;
  z: number;
  halfWidth: number;
  halfHeight: number;
  halfDepth: number;
  angle: number;
  color: string;
}>();

const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        ramp: createCuboidCollider({
          halfExtents: [props.halfWidth, props.halfHeight, props.halfDepth],
          restitution: 0.2,
          friction: 0.4,
        }),
      },
    }),
  },
});

transform.posX.value = props.x;
transform.posY.value = props.y;
transform.posZ.value = props.z;
transform.setEuler({ z: props.angle });
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresBoxGeometry :args="[props.halfWidth * 2, props.halfHeight * 2, props.halfDepth * 2]" />
      <TresMeshStandardMaterial :color="props.color" />
    </TresMesh>
  </DumasEntity>
</template>
