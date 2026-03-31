<script setup lang="ts">
import {
  useEcsComponent,
  useRelationship,
  ChildOf,
  createTriggerZone,
  DumasEntity,
} from "@dumas/core";
import { ref } from "vue";
import { TowerTag, EnemyTag } from "./tags";
import { TOWER_RANGE, TOWER_BASE_HEIGHT, TOWER_HEAD_HEIGHT } from "./constants";

const props = defineProps<{
  posX: number;
  posZ: number;
}>();

const isTargeting = ref(false);
const enemiesInRange = ref<Set<number>>(new Set());

// ── Tower base entity ──────────────────────────────────────────────────────
const { eid: baseEid, transform: baseTransform } = useEcsComponent({
  components: {
    tower: TowerTag,
    trigger: createTriggerZone({
      radius: TOWER_RANGE,
      target: [EnemyTag],
      onEnter({ targetEid }) {
        enemiesInRange.value.add(targetEid);
        isTargeting.value = true;
      },
      onExit({ targetEid }) {
        enemiesInRange.value.delete(targetEid);
        if (enemiesInRange.value.size === 0) {
          isTargeting.value = false;
        }
      },
    }),
  },
});

baseTransform.posX.value = props.posX;
baseTransform.posY.value = 0;
baseTransform.posZ.value = props.posZ;

// ── Turret head (child of base) ────────────────────────────────────────────
const rel = useRelationship({ relation: ChildOf });

const { eid: headEid, transform: headTransform } = useEcsComponent({
  components: {},
});

headTransform.posX.value = props.posX;
headTransform.posY.value = TOWER_BASE_HEIGHT + TOWER_HEAD_HEIGHT;
headTransform.posZ.value = props.posZ;

rel.setParent({ child: headEid, parent: baseEid });

defineExpose({ baseEid, headEid, baseTransform, headTransform, enemiesInRange, isTargeting });
</script>

<template>
  <!-- Tower base -->
  <DumasEntity :eid="baseEid">
    <TresMesh :position="[0, TOWER_BASE_HEIGHT / 2, 0]">
      <TresCylinderGeometry :args="[0.4, 0.5, TOWER_BASE_HEIGHT, 8]" />
      <TresMeshStandardMaterial :color="isTargeting === true ? '#44aaff' : '#6688aa'" />
    </TresMesh>

    <!-- Range indicator (translucent ring on the ground) -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.02, 0]">
      <TresRingGeometry :args="[TOWER_RANGE - 0.05, TOWER_RANGE, 32]" />
      <TresMeshBasicMaterial
        :color="isTargeting === true ? '#44aaff' : '#335566'"
        :transparent="true"
        :opacity="0.25"
        :side="2"
      />
    </TresMesh>
  </DumasEntity>

  <!-- Turret head (child entity) -->
  <DumasEntity :eid="headEid">
    <TresMesh :position="[0, 0, 0]">
      <TresBoxGeometry :args="[0.25, TOWER_HEAD_HEIGHT, 0.6]" />
      <TresMeshStandardMaterial
        :color="isTargeting === true ? '#66ccff' : '#88aacc'"
        emissive="#224466"
        :emissive-intensity="isTargeting === true ? 1.5 : 0.3"
      />
    </TresMesh>
  </DumasEntity>
</template>
