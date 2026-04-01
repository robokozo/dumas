<script setup lang="ts">
import { shallowRef, toRef } from "vue";
import {
  DumasEntity,
  useEcsComponent,
  useRelationship,
  useEntityRef,
  ChildOf,
  createTriggerZone,
} from "@dumas/core";
import { WeaponTag, EnemyTag } from "./tags";
import {
  WEAPON_OFFSET,
  WEAPON_HALF_WIDTH,
  WEAPON_HALF_HEIGHT,
  WEAPON_HALF_DEPTH,
  WEAPON_COLOR,
  WEAPON_ACTIVE_COLOR,
  WEAPON_TRIGGER_RADIUS,
  SWING_DURATION,
  WEAPON_DAMAGE,
} from "./constants";

const props = defineProps<{
  parentEid: number;
}>();

const emit = defineEmits<{
  hit: [{ enemyEid: number }];
}>();

const isSwinging = shallowRef(false);
const swingTimer = shallowRef(0);
const weaponAngle = shallowRef(0);

const parentRef = useEntityRef({ eid: toRef(() => props.parentEid) });

const { eid, transform } = useEcsComponent({
  components: {
    weapon: WeaponTag,
    trigger: createTriggerZone({
      radius: WEAPON_TRIGGER_RADIUS,
      target: [EnemyTag],
      onEnter({ targetEid }) {
        if (isSwinging.value === true) {
          emit("hit", { enemyEid: targetEid });
        }
      },
    }),
  },
  fn: ({ delta }) => {
    const parentTransform = parentRef.transform;
    if (parentTransform === null) {
      return;
    }

    const px = parentTransform.posX.value;
    const pz = parentTransform.posZ.value;

    // Get the parent's facing direction from rotation
    const parentRotY = parentTransform.rotY.value;
    const parentRotW = parentTransform.rotW.value;
    // Extract yaw angle from quaternion Y component
    const facing = 2 * Math.atan2(parentRotY, parentRotW);

    // During swing, animate the weapon in an arc
    if (swingTimer.value > 0) {
      swingTimer.value -= delta;
      const swingProgress = 1 - swingTimer.value / SWING_DURATION;
      // Sweep from -90 to +90 degrees relative to facing
      weaponAngle.value = facing + (swingProgress - 0.5) * Math.PI;

      if (swingTimer.value <= 0) {
        swingTimer.value = 0;
        isSwinging.value = false;
      }
    } else {
      // Rest position: weapon in front of player
      weaponAngle.value = facing;
    }

    // Position weapon at offset from parent
    transform.posX.value = px + Math.sin(weaponAngle.value) * WEAPON_OFFSET;
    transform.posY.value = 0.5;
    transform.posZ.value = pz + Math.cos(weaponAngle.value) * WEAPON_OFFSET;
  },
});

// Link weapon to player via ChildOf
const rel = useRelationship({ relation: ChildOf });
rel.setParent({ child: eid, parent: props.parentEid });

function startSwing(): void {
  if (isSwinging.value === true) {
    return;
  }
  isSwinging.value = true;
  swingTimer.value = SWING_DURATION;
}

defineExpose({ startSwing, eid });
</script>

<template>
  <DumasEntity :eid="eid">
    <TresMesh>
      <TresBoxGeometry
        :args="[WEAPON_HALF_WIDTH * 2, WEAPON_HALF_HEIGHT * 2, WEAPON_HALF_DEPTH * 2]"
      />
      <TresMeshStandardMaterial
        :color="isSwinging === true ? WEAPON_ACTIVE_COLOR : WEAPON_COLOR"
        :emissive="isSwinging === true ? WEAPON_ACTIVE_COLOR : '#000000'"
        :emissive-intensity="isSwinging === true ? 0.6 : 0"
      />
    </TresMesh>
  </DumasEntity>
</template>
