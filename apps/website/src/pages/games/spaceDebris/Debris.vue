<script setup lang="ts">
import { shallowRef, toRef } from "vue";
import { DumasEntity, useEcsComponent, useEntityRef } from "@dumas/core";
import type { DebrisConfig } from "./types";
import { TRACTOR_BEAM_RADIUS, TRACTOR_PULL_SPEED, COLLECTION_DISTANCE } from "./constants";

const props = defineProps<{
  config: DebrisConfig;
  shipEid: number | null;
  isTractorActive: boolean;
}>();

const emit = defineEmits<{
  collected: [{ id: number }];
}>();

const isCollected = shallowRef(false);

const shipEidRef = toRef(props, "shipEid");

const shipRef = useEntityRef({
  eid: shipEidRef,
});

const { eid, transform } = useEcsComponent({
  components: {},
  fn: ({ delta, elapsed }) => {
    if (isCollected.value === true) return;

    // Tumble animation
    transform.setEuler({
      x: elapsed * props.config.tumbleSpeedX,
      y: elapsed * props.config.tumbleSpeedY,
      z: elapsed * props.config.tumbleSpeedZ,
    });

    // Tractor beam pull logic
    if (props.isTractorActive === true && props.shipEid !== null) {
      const shipTransform = shipRef.transform;
      if (shipTransform !== null) {
        const shipX = shipTransform.posX.value;
        const shipZ = shipTransform.posZ.value;
        const dx = shipX - transform.posX.value;
        const dz = shipZ - transform.posZ.value;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < TRACTOR_BEAM_RADIUS) {
          // Pull toward ship
          const pullStrength = (1 - dist / TRACTOR_BEAM_RADIUS) * TRACTOR_PULL_SPEED * delta;
          transform.posX.value += (dx / dist) * pullStrength;
          transform.posZ.value += (dz / dist) * pullStrength;

          // Check collection
          if (dist < COLLECTION_DISTANCE) {
            isCollected.value = true;
            emit("collected", { id: props.config.id });
          }
        }
      }
    }
  },
});

// Set initial position
transform.posX.value = props.config.x;
transform.posZ.value = props.config.z;
transform.posY.value = 0;
</script>

<template>
  <DumasEntity v-if="isCollected === false" :eid="eid">
    <!-- Rock type — irregular sphere -->
    <template v-if="props.config.type === 'rock'">
      <TresMesh>
        <TresDodecahedronGeometry :args="[props.config.size, 0]" />
        <TresMeshStandardMaterial
          :color="props.config.color"
          :emissive="props.config.color"
          :emissive-intensity="0.1"
          :roughness="0.9"
        />
      </TresMesh>
    </template>

    <!-- Panel type — flat rectangle -->
    <template v-if="props.config.type === 'panel'">
      <TresMesh>
        <TresBoxGeometry
          :args="[props.config.size * 2, props.config.size * 0.1, props.config.size]"
        />
        <TresMeshStandardMaterial
          :color="props.config.color"
          :emissive="props.config.color"
          :emissive-intensity="0.3"
        />
      </TresMesh>
    </template>

    <!-- Hull type — cylinder chunk -->
    <template v-if="props.config.type === 'hull'">
      <TresMesh>
        <TresCylinderGeometry
          :args="[props.config.size * 0.5, props.config.size * 0.7, props.config.size, 6]"
        />
        <TresMeshStandardMaterial
          :color="props.config.color"
          :emissive="props.config.color"
          :emissive-intensity="0.15"
          :metalness="0.6"
        />
      </TresMesh>
    </template>

    <!-- Crystal type — octahedron -->
    <template v-if="props.config.type === 'crystal'">
      <TresMesh>
        <TresOctahedronGeometry :args="[props.config.size, 0]" />
        <TresMeshStandardMaterial
          :color="props.config.color"
          :emissive="props.config.color"
          :emissive-intensity="0.8"
          :transparent="true"
          :opacity="0.8"
        />
      </TresMesh>
    </template>
  </DumasEntity>
</template>
