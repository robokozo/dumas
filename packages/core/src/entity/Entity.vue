<script setup lang="ts">
import { provide, onUnmounted } from "vue";
import { addEntity, removeEntity } from "bitecs";
import { useWorld } from "../world/useWorld";
import { ENTITY_KEY } from "../keys";
import type { EntityContext } from "./types";

const { ecsWorld } = useWorld();

const eid = addEntity(ecsWorld);

const ctx: EntityContext = { eid, isPersistent: false };
provide(ENTITY_KEY, ctx);

onUnmounted(() => {
  removeEntity(ecsWorld, eid);
});
</script>

<template>
  <slot />
</template>
