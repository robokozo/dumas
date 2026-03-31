<script setup lang="ts">
/**
 * Demo: useObserver fires once per archetype add/remove.
 *
 * Three boxes appear one-by-one, then disappear one-by-one.
 * The log updates entirely from the observer — no polling.
 */
import { ref } from "vue";
import { Scene, useEcsComponent, useObserver, useGame, useSystem } from "@dumas/core";
import { TRANSFORM_TYPE } from "@dumas/core";
import type { TransformStore } from "@dumas/core";
import SpawnBox from "./SpawnBox.vue";

const SLOTS = [
  { x: -2, color: "#ff6b6b" },
  { x: 0, color: "#4ecdc4" },
  { x: 2, color: "#ffe66d" },
] as const;

// generation[i] increments each time slot i respawns, forcing a fresh entity
const generation = [0, 0, 0];
const active = ref([false, false, false]);

const log = ref<Array<string>>([]);
const count = ref(0);

// ── Observer setup ─────────────────────────────────────────────────────────────
// Create an anchor entity first so the TransformStore exists when useObserver
// is called. onAdd does NOT fire retroactively for existing entities in bitECS,
// so the anchor is silently ignored by the observer.
const { eid: anchorEid } = useEcsComponent({ components: {} });

const { storeRegistry } = useGame();
const tStore = storeRegistry.get(TRANSFORM_TYPE) as TransformStore;

useObserver({
  components: [tStore],
  onAdd: ({ eid }) => {
    if (eid === anchorEid) return;
    count.value += 1;
    log.value = [`+ eid ${eid} joined`, ...log.value].slice(0, 6);
  },
  onRemove: ({ eid }) => {
    if (eid === anchorEid) return;
    count.value = Math.max(0, count.value - 1);
    log.value = [`− eid ${eid} left`, ...log.value].slice(0, 6);
  },
});

// ── Sequential spawn/despawn cycle ────────────────────────────────────────────
// Phase 0-2: spawn slots in order. Phase 3-5: despawn in order.
let phase = 0;
let timer = 0;

useSystem({
  components: [],
  fn: ({ delta }) => {
    timer += delta;
    if (timer < 1.2) return;
    timer = 0;

    if (phase < 3) {
      generation[phase] += 1;
      active.value[phase] = true;
    } else {
      active.value[phase - 3] = false;
    }
    active.value = [...active.value];

    phase = (phase + 1) % 6;
  },
});
</script>

<template>
  <Scene name="observer-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 0, 10]" :look-at="[0, 0, 0]" :fov="50" />
    <TresAmbientLight :intensity="0.6" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.5" />

    <template v-for="(slot, i) in SLOTS" :key="i">
      <SpawnBox v-if="active[i]" :key="`${i}-${generation[i]}`" :x="slot.x" :color="slot.color" />
    </template>

    <template #overlay>
      <div class="obs">
        <div class="obs__count">{{ count }} active</div>
        <div
          v-for="(entry, j) in log"
          :key="j"
          class="obs__entry"
          :class="{ add: entry.startsWith('+'), remove: entry.startsWith('−') }"
        >
          {{ entry }}
        </div>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.obs {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  font-family: monospace;
  font-size: 0.72rem;
  pointer-events: none;
}
.obs__count {
  color: rgba(255, 255, 255, 0.5);
  font-family: sans-serif;
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
}
.obs__entry {
  line-height: 1.7;
}
.obs__entry.add {
  color: #4f4;
}
.obs__entry.remove {
  color: #f44;
}
</style>
