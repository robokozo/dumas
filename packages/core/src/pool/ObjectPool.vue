<script setup lang="ts" generic="F extends Record<string, ComponentFactory>">
import type { ComponentFactory } from "../types";
import type { PoolInstance } from "./types";
import type { InstancesOf, SlicedComponents } from "../entity/types";

defineProps<{
  pool: PoolInstance<F>;
}>();

defineSlots<{
  default(props: SlicedComponents<InstancesOf<F>>): unknown;
}>();
</script>

<template>
  <TresGroup v-for="slot in pool.slots" :key="slot.eid" :visible="slot.isActive.value">
    <slot v-bind="slot.components" />
  </TresGroup>
</template>
