<script setup lang="ts">
import { provide } from "vue";
import { useGameObject } from "../composables/useGameObject";
import { GAME_OBJECT_EID_KEY } from "../keys";
import type { GameObjectOptions } from "../types";

const props = defineProps<GameObjectOptions>();

const { groupRef, eid, position, rotation } = useGameObject({
  position: props.position,
  rotation: props.rotation,
  scale: props.scale,
});

provide(GAME_OBJECT_EID_KEY, eid);
defineExpose({ eid, position, rotation });
</script>

<template>
  <TresGroup ref="groupRef">
    <slot :eid="eid" />
  </TresGroup>
</template>
