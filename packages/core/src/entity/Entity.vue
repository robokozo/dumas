<script setup lang="ts">
import { onUnmounted } from "vue";
import { addEntity, addComponent, removeEntity } from "bitecs";
import { useGame } from "../world/useGame";
import { PersistentTag } from "../ecs/components";
import type { EntityContext } from "./types";

const props = withDefaults(
  defineProps<{
    persistence?: "persistent" | "transient";
  }>(),
  { persistence: "transient" },
);

const { world } = useGame();

const eid = addEntity(world);
const isPersistent = props.persistence === "persistent";

if (isPersistent === true) {
  addComponent(world, eid, PersistentTag);
}

const ctx: EntityContext = { eid, isPersistent };

onUnmounted(() => {
  removeEntity(world, eid);
});
</script>

<template>
  <slot v-bind="ctx" />
</template>
