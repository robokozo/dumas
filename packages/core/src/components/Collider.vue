<script setup lang="ts">
import { inject } from "vue";
import { useCollider } from "../composables/useCollider";
import { GAME_OBJECT_EID_KEY } from "../keys";
import type { ColliderOptions } from "../types";

const props = defineProps<Omit<ColliderOptions, "eid"> & { eid?: number }>();

const injectedEid = inject(GAME_OBJECT_EID_KEY);
const eid = props.eid ?? injectedEid;

if (eid === undefined) {
  throw new Error("Collider: eid must be provided via prop or a parent GameObject");
}

const { eid: _eid, ...restProps } = props;
const { collider } = useCollider({ eid, ...restProps });

defineExpose({ collider });
</script>

<template>
  <slot :collider="collider" />
</template>
