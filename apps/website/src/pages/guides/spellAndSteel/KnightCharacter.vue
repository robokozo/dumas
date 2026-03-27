<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useGLTF, useAnimations } from "@tresjs/cientos";
import type { AnimationAction } from "three";
import * as THREE from "three";

const FADE_DURATION = 0.3;

const { animation = "Idle", position = [0, 0, 0] } = defineProps<{
  animation?: string;
  position?: [number, number, number];
}>();

const { state, nodes } = useGLTF(`${import.meta.env.BASE_URL}models/Knight.glb`);

const animations = computed(() => state.value?.animations ?? []);
const rig = computed(() => nodes.value.Rig);

const { actions } = useAnimations(animations, rig);

const currentAction = ref<AnimationAction | null>(null);

function transitionTo(name: string): void {
  const next = actions[name];
  if (next === null || next === undefined) return;

  if (currentAction.value !== null) {
    currentAction.value.fadeOut(FADE_DURATION);
  }

  next.reset();
  next.setEffectiveWeight(1);
  next.setLoop(THREE.LoopRepeat, Infinity);
  next.fadeIn(FADE_DURATION);
  next.play();

  currentAction.value = next;
}

watch(
  () => [actions, animation] as const,
  ([nextActions, nextAnimation]) => {
    if (nextActions[nextAnimation] !== undefined) {
      transitionTo(nextAnimation);
    }
  },
);
</script>

<template>
  <primitive v-if="rig != null" :object="rig" :position="position" />
</template>
