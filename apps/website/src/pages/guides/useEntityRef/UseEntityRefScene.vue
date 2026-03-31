<script setup lang="ts">
/**
 * Demo: useEntityRef gives reactive read access to another entity's components.
 *
 * A "target" sphere bobs up and down. A "tracker" cube reads the target's
 * transform via useEntityRef and follows it on the X axis with an offset.
 * The tracker also uses has() to check if the target carries the ActiveTag.
 */
import {
  Scene,
  useEcsComponent,
  useEntityRef,
  useSystem,
  defineTag,
  DumasEntity,
} from "@dumas/core";
import { ref } from "vue";

const BOB_SPEED = 2;
const BOB_AMPLITUDE = 2;
const FOLLOW_OFFSET_X = 3;
const FOLLOW_LERP = 0.04;

const ActiveTag = defineTag();

// ── Target entity (bobbing sphere) ────────────────────────────────────────
const target = useEcsComponent({ components: { active: ActiveTag } });
target.transform.posX.value = 0;
target.transform.posY.value = 0;

// ── Tracker reads the target's transform reactively ───────────────────────
const trackerRef = useEntityRef({ eid: target.eid });

// ── Tracker entity (following cube) ───────────────────────────────────────
const tracker = useEcsComponent({ components: {} });
tracker.transform.posX.value = FOLLOW_OFFSET_X;
tracker.transform.posY.value = 0;

// ── Overlay data ──────────────────────────────────────────────────────────
const targetY = ref(0);
const hasActiveTag = ref(false);

// ── System: bob the target and make the tracker follow ────────────────────
useSystem({
  fn: ({ elapsed }) => {
    // Bob the target sphere
    const newY = Math.sin(elapsed * BOB_SPEED) * BOB_AMPLITUDE;
    target.transform.posY.value = newY;

    // Tracker follows target Y with lerp
    const refTransform = trackerRef.transform;
    if (refTransform !== null) {
      const targetPosY = refTransform.posY.value;
      tracker.transform.posY.value += (targetPosY - tracker.transform.posY.value) * FOLLOW_LERP;
    }

    // Update overlay
    targetY.value = Math.round(newY * 100) / 100;
    hasActiveTag.value = trackerRef.has({ tag: ActiveTag });
  },
});
</script>

<template>
  <Scene name="entity-ref-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 2, 10]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.8" />

    <!-- Target sphere (bobs up and down) -->
    <DumasEntity :eid="target.eid">
      <TresMesh>
        <TresSphereGeometry :args="[0.6, 16, 16]" />
        <TresMeshStandardMaterial color="#44aaff" />
      </TresMesh>
    </DumasEntity>

    <!-- Tracker cube (follows target Y with offset on X) -->
    <DumasEntity :eid="tracker.eid">
      <TresMesh>
        <TresBoxGeometry :args="[0.8, 0.8, 0.8]" />
        <TresMeshStandardMaterial color="#ff8844" />
      </TresMesh>
    </DumasEntity>

    <!-- Ground plane -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -3, 0]">
      <TresPlaneGeometry :args="[14, 8]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <template #overlay>
      <div class="hud">
        <div class="hud__row">
          <span class="badge target">Target Y: {{ targetY }}</span>
        </div>
        <div class="hud__row">
          <span class="badge" :class="hasActiveTag === true ? 'active' : 'inactive'">
            has(ActiveTag): {{ hasActiveTag }}
          </span>
        </div>
        <div class="hud__row">
          <span class="pill">Blue = target | Orange = tracker</span>
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
}

.badge {
  font-family: monospace;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.badge.target {
  border: 1px solid rgba(68, 170, 255, 0.5);
  color: rgba(68, 170, 255, 0.9);
  background: rgba(68, 170, 255, 0.1);
}

.badge.active {
  border: 1px solid rgba(68, 204, 68, 0.5);
  color: rgba(68, 204, 68, 0.9);
  background: rgba(68, 204, 68, 0.1);
}

.badge.inactive {
  border: 1px solid rgba(204, 68, 68, 0.5);
  color: rgba(204, 68, 68, 0.9);
  background: rgba(204, 68, 68, 0.1);
}
</style>
