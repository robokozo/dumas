<script setup lang="ts">
import { inject } from "vue";
import { useRigidBody } from "../composables/useRigidBody";
import { GAME_OBJECT_EID_KEY } from "../keys";
import type { RigidBodyOptions, RigidBodyType } from "../types";

const props = defineProps<Omit<RigidBodyOptions, "eid"> & { eid?: number }>();

const injectedEid = inject(GAME_OBJECT_EID_KEY);
const eid = props.eid ?? injectedEid;

if (eid === undefined) {
  throw new Error("RigidBody: eid must be provided via prop or a parent GameObject");
}

const { rigidBody, applyImpulse, applyForce, setLinvel, setAngvel } = useRigidBody({
  eid,
  type: props.type,
});

defineExpose({ rigidBody, applyImpulse, applyForce, setLinvel, setAngvel });
</script>

<template>
  <slot v-bind="{ rigidBody, applyImpulse, applyForce, setLinvel, setAngvel }" />
</template>
