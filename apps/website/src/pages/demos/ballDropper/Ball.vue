<script setup lang="ts">
import { inject } from "vue";
import { tryOnUnmounted } from "@vueuse/core";
import { useGameObject, useRigidBody, useCollider, useSystem } from "@dumas/core";

const props = defineProps<{
  id: number;
  spawnX: number;
  spawnZ: number;
}>();

const emit = defineEmits<{ destroyed: [id: number] }>();

const SPAWN_Y = 4.5;
const KILL_Y = -5;
const BALL_RADIUS = 0.15;

const ballEids = inject<Set<number>>("ballEids")!;
const destroyEids = inject<Set<number>>("destroyEids")!;
const ballIdToEid = inject<Map<number, number>>("ballIdToEid")!;

const { eid, groupRef } = useGameObject({
  position: { x: props.spawnX, y: SPAWN_Y, z: props.spawnZ },
});

ballEids.add(eid);
ballIdToEid.set(props.id, eid);

tryOnUnmounted(() => {
  ballEids.delete(eid);
  ballIdToEid.delete(props.id);
});

const { rigidBody } = useRigidBody({ eid, type: "dynamic" });

useCollider({ eid, shape: "sphere", radius: BALL_RADIUS });

let isDestroyed = false;

useSystem({
  fn: () => {
    if (isDestroyed) return;
    const body = rigidBody.value;
    if (body === null) return;
    if (body.translation().y < KILL_Y || destroyEids.has(eid)) {
      isDestroyed = true;
      ballEids.delete(eid);
      destroyEids.delete(eid);
      emit("destroyed", props.id);
    }
  },
});

function setGroupRef(el: object | null): void {
  groupRef.value = el as (typeof groupRef)["value"];
}
</script>

<template>
  <TresGroup
    :ref="
      (el: any) => {
        setGroupRef(el);
      }
    "
  >
    <TresMesh>
      <TresSphereGeometry :args="[0.15, 12, 12]" />
      <TresMeshStandardMaterial color="#ffffff" :metalness="0.15" :roughness="0.5" />
    </TresMesh>
  </TresGroup>
</template>
