<script setup lang="ts">
import { DumasEntity, useEcsComponent, createPhysics, createSphereCollider } from "@dumas/core";
import { BALL_RADIUS } from "./types";

const props = defineProps<{
  spawnX: number;
  spawnY: number;
  spawnZ: number;
}>();

const emit = defineEmits<{
  registered: [{ eid: number }];
}>();

const createBallBody = createPhysics({
  type: "dynamic",
  colliders: {
    ball: createSphereCollider({ radius: BALL_RADIUS, restitution: 0.35, friction: 0.6 }),
  },
  linearDamping: 0.3,
  angularDamping: 0.3,
});

const { eid, transform } = useEcsComponent({
  components: { physics: createBallBody },
});

transform.posX.value = props.spawnX;
transform.posY.value = props.spawnY;
transform.posZ.value = props.spawnZ;

emit("registered", { eid });
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresSphereGeometry :args="[BALL_RADIUS, 12, 12]" />
      <TresMeshStandardMaterial color="#eeeeee" :metalness="0.4" :roughness="0.3" />
    </TresMesh>
  </DumasEntity>
</template>
