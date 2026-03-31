<script setup lang="ts">
import { shallowRef, onMounted } from "vue";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Group } from "three";
import { DumasEntity, useEcsComponent, createPhysics, createCuboidCollider } from "@dumas/core";

const props = defineProps<{ startX: number; startY: number; startZ: number }>();
const emit = defineEmits<{ scored: [] }>();

const model = shallowRef<Group | null>(null);

onMounted(() => {
  new GLTFLoader().load("/dumas/models/games/Card Backing.glb", (gltf) => {
    model.value = gltf.scene;
  });
});

let hasScored = false;

const { eid, transform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      colliders: {
        body: createCuboidCollider({
          halfExtents: [0.35, 0.5, 0.5],
          restitution: 0.05,
          friction: 0.9,
        }),
      },
    }),
  },
  fn: ({ transform: t }) => {
    if (hasScored === false && t.posY.value < -1.5) {
      hasScored = true;
      emit("scored");
    }
  },
});

transform.posX.value = props.startX;
transform.posY.value = props.startY;
transform.posZ.value = props.startZ;
</script>

<template>
  <DumasEntity :eid="eid">
    <primitive v-if="model !== null" :object="model" :scale="0.6" :rotation="[Math.PI / 2, 0, 0]" />
  </DumasEntity>
</template>
