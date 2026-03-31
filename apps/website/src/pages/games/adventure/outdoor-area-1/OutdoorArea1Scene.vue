<script setup lang="ts">
import { Scene } from "@dumas/core";
import { provideAdventureContext } from "../shared/useAdventureContext";
import AdventureCharacter from "../shared/AdventureCharacter.vue";
import AdventureUI from "../shared/AdventureUI.vue";
import OutdoorArea1Environment from "./OutdoorArea1Environment.vue";
import OutdoorArea1Chest from "./OutdoorArea1Chest.vue";
import OutdoorArea1Sign from "./OutdoorArea1Sign.vue";
import OutdoorArea1Orb from "./OutdoorArea1Orb.vue";

const ctx = provideAdventureContext();

function onCharacterReady({ eid }: { eid: number }): void {
  ctx.charEid.value = eid;
}

function onCharacterArrived(): void {
  ctx.isMoving.value = false;
  ctx.openPendingItem();
}

function onGroundClick({ pos }: { pos: { x: number; z: number } }): void {
  if (ctx.activeItemId.value !== null) return;
  ctx.targetX.value = pos.x;
  ctx.targetZ.value = pos.z;
  ctx.isMoving.value = true;
  ctx.pendingItemId.value = null;
}
</script>

<template>
  <Scene name="outdoor-area-1" :default="true">
    <TresPerspectiveCamera :position="[0, 14, 12]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.55" />
    <TresDirectionalLight :position="[5, 10, 8]" :intensity="1.4" color="#fff8ee" />
    <TresDirectionalLight :position="[-5, 6, -4]" :intensity="0.35" color="#aaccff" />
    <TresPointLight :position="[1, 1.5, -4]" :intensity="8" :distance="5" color="#40c0e0" />
    <TresPointLight :position="[4, 1, 1]" :intensity="4" :distance="4" color="#f0c040" />

    <OutdoorArea1Environment @ground-click="(pos) => onGroundClick({ pos })" />

    <AdventureCharacter
      :target-x="ctx.targetX.value"
      :target-z="ctx.targetZ.value"
      :is-moving="ctx.isMoving.value"
      @ready="(eid) => onCharacterReady({ eid })"
      @arrived="() => onCharacterArrived()"
    />

    <OutdoorArea1Chest />
    <OutdoorArea1Sign />
    <OutdoorArea1Orb />

    <template #overlay>
      <AdventureUI :ctx="ctx" />
      <div class="hint">Click to move &nbsp;·&nbsp; Click objects or approach to interact</div>
    </template>
  </Scene>
</template>

<style scoped>
.hint {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: sans-serif;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  white-space: nowrap;
}
</style>
