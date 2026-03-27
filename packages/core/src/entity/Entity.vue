<script setup lang="ts">
import { provide, onUnmounted } from "vue";
import { addEntity, addComponent, removeEntity } from "bitecs";
import { useWorld } from "../world/useWorld";
import { ENTITY_KEY } from "../keys";
import { PersistentTag } from "../ecs/components";
import type { EntityContext } from "./types";

const props = withDefaults(
  defineProps<{
    persistence?: "persistent" | "transient";
  }>(),
  { persistence: "transient" },
);

const { ecsWorld } = useWorld();

const eid = addEntity(ecsWorld);
const isPersistent = props.persistence === "persistent";

if (isPersistent === true) {
  addComponent(ecsWorld, eid, PersistentTag);
}

const ctx: EntityContext = { eid, isPersistent };
provide(ENTITY_KEY, ctx);

onUnmounted(() => {
  removeEntity(ecsWorld, eid);
});
</script>

<template>
  <slot v-bind="ctx" />
</template>
