<script setup lang="ts">
import { shallowRef } from "vue";
import { Scene, defineInputMap, useInput } from "@dumas/core";

const AXIS_THRESHOLD = 0.5;

const INPUT_MAP = defineInputMap({
  left: ({ keys, gamepad }) =>
    keys.a?.value === true ||
    keys.arrowleft?.value === true ||
    gamepad.value?.buttons[14]?.pressed === true ||
    (gamepad.value?.axes[0] ?? 0) < -AXIS_THRESHOLD,
  right: ({ keys, gamepad }) =>
    keys.d?.value === true ||
    keys.arrowright?.value === true ||
    gamepad.value?.buttons[15]?.pressed === true ||
    (gamepad.value?.axes[0] ?? 0) > AXIS_THRESHOLD,
  action: ({ keys, gamepad }) =>
    keys.space?.value === true || gamepad.value?.buttons[0]?.pressed === true,
  charge: ({ keys, gamepad }) =>
    keys.e?.value === true || gamepad.value?.buttons[2]?.pressed === true,
});

const posX = shallowRef(0);
// Counts down from 1 to 0 to drive a sin-arc jump animation.
const jumpArc = shallowRef(0);
// Charges up to 1 while E is held, drains when released.
const chargeLevel = shallowRef(0);
// Hold the pressed/released badges visible for a short window after they fire.
const pressedFlash = shallowRef(0);
const releasedFlash = shallowRef(0);

const SPEED = 4;
const CHARGE_SPEED = 0.8;
const DRAIN_SPEED = 1.5;
const FLASH_DURATION = 0.2;

const { held } = useInput({
  map: INPUT_MAP,
  fn: ({ delta, held, pressed, released }) => {
    if (held.left.value === true) posX.value -= SPEED * delta;
    if (held.right.value === true) posX.value += SPEED * delta;
    posX.value = Math.max(-3.5, Math.min(3.5, posX.value));

    if (pressed.action.value === true && jumpArc.value === 0) jumpArc.value = 1;
    if (jumpArc.value > 0) jumpArc.value = Math.max(0, jumpArc.value - delta * 2.5);

    if (held.charge.value === true) {
      chargeLevel.value = Math.min(1, chargeLevel.value + delta * CHARGE_SPEED);
    } else {
      chargeLevel.value = Math.max(0, chargeLevel.value - delta * DRAIN_SPEED);
    }

    const anyPressed =
      pressed.left.value === true ||
      pressed.right.value === true ||
      pressed.action.value === true ||
      pressed.charge.value === true;
    const anyReleased =
      released.left.value === true ||
      released.right.value === true ||
      released.action.value === true ||
      released.charge.value === true;

    if (anyPressed === true) pressedFlash.value = FLASH_DURATION;
    if (anyReleased === true) releasedFlash.value = FLASH_DURATION;
    if (pressedFlash.value > 0) pressedFlash.value = Math.max(0, pressedFlash.value - delta);
    if (releasedFlash.value > 0) releasedFlash.value = Math.max(0, releasedFlash.value - delta);
  },
});
</script>

<template>
  <Scene name="demo" :default="true">
    <TresPerspectiveCamera :position="[0, 3, 8]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.6" />
    <TresDirectionalLight :position="[4, 8, 4]" :intensity="2" />

    <!-- Ground -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[10, 6]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <!-- Ball — arcs upward on action press, turns gold while airborne, glows when charged -->
    <TresMesh :position="[posX, 0.5 + Math.sin(jumpArc * Math.PI) * 2, 0]">
      <TresSphereGeometry :args="[0.5, 24, 24]" />
      <TresMeshStandardMaterial
        :color="jumpArc > 0 ? '#f0c040' : '#4488ff'"
        :emissive="jumpArc > 0 ? '#f0c040' : '#4488ff'"
        :emissive-intensity="chargeLevel * 4"
      />
    </TresMesh>

    <template #overlay>
      <div class="hud">
        <div class="hud__row">
          <span :class="['pill', held.left.value === true && 'pill--active']">← A</span>
          <span :class="['pill', held.right.value === true && 'pill--active']">D →</span>
          <span :class="['pill', held.action.value === true && 'pill--active']">Space</span>
          <span :class="['pill', held.charge.value === true && 'pill--active']">E</span>
        </div>
        <div class="hud__row">
          <span :class="['badge', pressedFlash > 0 && 'badge--on']">pressed</span>
          <span :class="['badge badge--rel', releasedFlash > 0 && 'badge--on']">released</span>
        </div>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.hud {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  pointer-events: none;
}

.hud__row {
  display: flex;
  gap: 0.4rem;
}

.pill {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.35);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  transition: all 0.05s;
}

.pill--active {
  border-color: rgba(68, 136, 255, 0.8);
  color: rgba(100, 180, 255, 1);
  background: rgba(68, 136, 255, 0.2);
}

.badge {
  font-family: monospace;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.05s;
}

.badge--on {
  color: rgba(80, 220, 120, 1);
  border-color: rgba(80, 220, 120, 0.7);
  background: rgba(80, 220, 120, 0.15);
}

.badge--rel.badge--on {
  color: rgba(255, 160, 60, 1);
  border-color: rgba(255, 160, 60, 0.7);
  background: rgba(255, 160, 60, 0.15);
}
</style>
