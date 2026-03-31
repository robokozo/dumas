<script setup lang="ts">
import { ref, shallowRef } from "vue";
import {
  DumasEntity,
  useEcsComponent,
  defineInputMap,
  useInput,
  useWorldToScreen,
} from "@dumas/core";
import { PlayerTag } from "./tags";
import {
  PLAYER_SPEED,
  PLAYER_MAX_HEALTH,
  PLAYER_COLOR,
  ARENA_HALF_SIZE,
  ATTACK_COOLDOWN,
  ANALOG_THRESHOLD,
  ENEMY_DAMAGE_COOLDOWN,
  ENEMY_CONTACT_DAMAGE,
} from "./constants";
import BrawlerWeapon from "./BrawlerWeapon.vue";

const emit = defineEmits<{
  defeated: [];
  healthChanged: [{ current: number; max: number }];
  weaponHit: [{ enemyEid: number }];
}>();

const health = ref(PLAYER_MAX_HEALTH);
const attackCooldown = shallowRef(0);
const damageCooldown = shallowRef(0);
const weaponRef = shallowRef<InstanceType<typeof BrawlerWeapon> | null>(null);

const INPUT_MAP = defineInputMap({
  moveUp: ({ keys, gamepad }) =>
    keys.w?.value === true ||
    keys.arrowup?.value === true ||
    (gamepad.value?.axes[1] ?? 0) < -ANALOG_THRESHOLD,
  moveDown: ({ keys, gamepad }) =>
    keys.s?.value === true ||
    keys.arrowdown?.value === true ||
    (gamepad.value?.axes[1] ?? 0) > ANALOG_THRESHOLD,
  moveLeft: ({ keys, gamepad }) =>
    keys.a?.value === true ||
    keys.arrowleft?.value === true ||
    (gamepad.value?.axes[0] ?? 0) < -ANALOG_THRESHOLD,
  moveRight: ({ keys, gamepad }) =>
    keys.d?.value === true ||
    keys.arrowright?.value === true ||
    (gamepad.value?.axes[0] ?? 0) > ANALOG_THRESHOLD,
  attack: ({ keys, gamepad }) =>
    keys.space?.value === true || gamepad.value?.buttons[0]?.pressed === true,
});

const { eid, transform } = useEcsComponent({
  components: {
    player: PlayerTag,
  },
});

// Initial position at center
transform.posX.value = 0;
transform.posY.value = 0.5;
transform.posZ.value = 0;

const { x: screenX, y: screenY, isVisible } = useWorldToScreen({ eid });

useInput({
  map: INPUT_MAP,
  fn: ({ delta, held, pressed }) => {
    // Movement
    let dx = 0;
    let dz = 0;

    if (held.moveUp.value === true) {
      dz -= 1;
    }
    if (held.moveDown.value === true) {
      dz += 1;
    }
    if (held.moveLeft.value === true) {
      dx -= 1;
    }
    if (held.moveRight.value === true) {
      dx += 1;
    }

    // Normalize diagonal movement
    const magnitude = Math.sqrt(dx * dx + dz * dz);
    if (magnitude > 0) {
      dx = (dx / magnitude) * PLAYER_SPEED * delta;
      dz = (dz / magnitude) * PLAYER_SPEED * delta;

      transform.posX.value = Math.max(
        -ARENA_HALF_SIZE + 1,
        Math.min(ARENA_HALF_SIZE - 1, transform.posX.value + dx),
      );
      transform.posZ.value = Math.max(
        -ARENA_HALF_SIZE + 1,
        Math.min(ARENA_HALF_SIZE - 1, transform.posZ.value + dz),
      );

      // Face movement direction
      const angle = Math.atan2(dx, dz);
      transform.setRotationY({ angle });
    }

    // Attack
    if (attackCooldown.value > 0) {
      attackCooldown.value -= delta;
    }

    if (pressed.attack.value === true && attackCooldown.value <= 0) {
      attackCooldown.value = ATTACK_COOLDOWN;
      weaponRef.value?.startSwing();
    }

    // Damage cooldown
    if (damageCooldown.value > 0) {
      damageCooldown.value -= delta;
    }
  },
});

function takeDamage(): void {
  if (damageCooldown.value > 0) {
    return;
  }
  damageCooldown.value = ENEMY_DAMAGE_COOLDOWN;
  health.value = Math.max(0, health.value - ENEMY_CONTACT_DAMAGE);
  emit("healthChanged", { current: health.value, max: PLAYER_MAX_HEALTH });

  if (health.value <= 0) {
    emit("defeated");
  }
}

defineExpose({ eid, takeDamage, screenX, screenY, isVisible, health });
</script>

<template>
  <DumasEntity :eid="eid">
    <!-- Player body — cylinder -->
    <TresMesh>
      <TresCylinderGeometry :args="[0.4, 0.4, 1, 12]" />
      <TresMeshStandardMaterial
        :color="PLAYER_COLOR"
        :emissive="PLAYER_COLOR"
        :emissive-intensity="0.15"
      />
    </TresMesh>
    <!-- Head — small sphere on top -->
    <TresMesh :position="[0, 0.65, 0]">
      <TresSphereGeometry :args="[0.22, 10, 10]" />
      <TresMeshStandardMaterial :color="PLAYER_COLOR" />
    </TresMesh>
  </DumasEntity>

  <BrawlerWeapon ref="weaponRef" :parent-eid="eid" @hit="(evt) => emit('weaponHit', evt)" />
</template>
