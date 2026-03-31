<script setup lang="ts">
/**
 * Demo: ChildOf relationship links child entities to a parent entity.
 *
 * A large "parent" sphere orbits in a circle. Two small "child" cubes are
 * linked to the parent via ChildOf. A system reads the parent's transform
 * through useEntityRef and applies an offset so the children follow.
 */
import {
  Scene,
  useEcsComponent,
  useEntityRef,
  useSystem,
  useRelationship,
  ChildOf,
  DumasEntity,
} from "@dumas/core";
import { ref } from "vue";

const ORBIT_RADIUS = 3;
const ORBIT_SPEED = 0.8;

const CHILD_OFFSET_A = { x: 1.2, y: 0.8, z: 0 };
const CHILD_OFFSET_B = { x: -1.2, y: -0.8, z: 0 };

const FOLLOW_LERP = 0.08;

// ── Relationship composable ─────────────────────────────────────────────────
const rel = useRelationship({ relation: ChildOf });

// ── Parent entity (orbiting sphere) ─────────────────────────────────────────
const parent = useEcsComponent({ components: {} });
parent.transform.posX.value = ORBIT_RADIUS;
parent.transform.posY.value = 0;
parent.transform.posZ.value = 0;

// ── Child A (small cube) ────────────────────────────────────────────────────
const childA = useEcsComponent({ components: {} });
childA.transform.posX.value = ORBIT_RADIUS + CHILD_OFFSET_A.x;
childA.transform.posY.value = CHILD_OFFSET_A.y;
childA.transform.posZ.value = CHILD_OFFSET_A.z;

// ── Child B (small cube) ────────────────────────────────────────────────────
const childB = useEcsComponent({ components: {} });
childB.transform.posX.value = ORBIT_RADIUS + CHILD_OFFSET_B.x;
childB.transform.posY.value = CHILD_OFFSET_B.y;
childB.transform.posZ.value = CHILD_OFFSET_B.z;

// ── Link children to parent via ChildOf ─────────────────────────────────────
rel.setParent({ child: childA.eid, parent: parent.eid });
rel.setParent({ child: childB.eid, parent: parent.eid });

// ── useEntityRef to read the parent's transform from children ───────────────
const parentRef = useEntityRef({ eid: parent.eid });

// ── Overlay data ────────────────────────────────────────────────────────────
const parentPos = ref({ x: 0, y: 0 });
const childAParentId = ref<number | null>(null);
const childBParentId = ref<number | null>(null);

// ── System: orbit the parent, children follow with offset ───────────────────
useSystem({
  fn: ({ elapsed }) => {
    // Orbit the parent in a circle on the XZ plane
    const angle = elapsed * ORBIT_SPEED;
    parent.transform.posX.value = Math.cos(angle) * ORBIT_RADIUS;
    parent.transform.posZ.value = Math.sin(angle) * ORBIT_RADIUS;
    parent.transform.posY.value = Math.sin(elapsed * 1.5) * 0.5;

    // Read parent transform via useEntityRef
    const parentTransform = parentRef.transform;
    if (parentTransform !== null) {
      const px = parentTransform.posX.value;
      const py = parentTransform.posY.value;
      const pz = parentTransform.posZ.value;

      // Child A follows parent with offset, lerped
      const targetAx = px + CHILD_OFFSET_A.x;
      const targetAy = py + CHILD_OFFSET_A.y;
      const targetAz = pz + CHILD_OFFSET_A.z;
      childA.transform.posX.value += (targetAx - childA.transform.posX.value) * FOLLOW_LERP;
      childA.transform.posY.value += (targetAy - childA.transform.posY.value) * FOLLOW_LERP;
      childA.transform.posZ.value += (targetAz - childA.transform.posZ.value) * FOLLOW_LERP;

      // Child B follows parent with offset, lerped
      const targetBx = px + CHILD_OFFSET_B.x;
      const targetBy = py + CHILD_OFFSET_B.y;
      const targetBz = pz + CHILD_OFFSET_B.z;
      childB.transform.posX.value += (targetBx - childB.transform.posX.value) * FOLLOW_LERP;
      childB.transform.posY.value += (targetBy - childB.transform.posY.value) * FOLLOW_LERP;
      childB.transform.posZ.value += (targetBz - childB.transform.posZ.value) * FOLLOW_LERP;

      // Update overlay
      parentPos.value = {
        x: Math.round(px * 100) / 100,
        y: Math.round(py * 100) / 100,
      };
    }

    // Query relationship status
    childAParentId.value = rel.getParent({ child: childA.eid });
    childBParentId.value = rel.getParent({ child: childB.eid });
  },
});
</script>

<template>
  <Scene name="relationships-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 6, 10]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.8" />

    <!-- Parent sphere (orbits in a circle) -->
    <DumasEntity :eid="parent.eid">
      <TresMesh>
        <TresSphereGeometry :args="[0.8, 24, 24]" />
        <TresMeshStandardMaterial color="#44aaff" />
      </TresMesh>
    </DumasEntity>

    <!-- Child A (small cube, follows parent) -->
    <DumasEntity :eid="childA.eid">
      <TresMesh>
        <TresBoxGeometry :args="[0.4, 0.4, 0.4]" />
        <TresMeshStandardMaterial color="#ff8844" />
      </TresMesh>
    </DumasEntity>

    <!-- Child B (small cube, follows parent) -->
    <DumasEntity :eid="childB.eid">
      <TresMesh>
        <TresBoxGeometry :args="[0.4, 0.4, 0.4]" />
        <TresMeshStandardMaterial color="#44ff88" />
      </TresMesh>
    </DumasEntity>

    <!-- Ground plane -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -2, 0]">
      <TresPlaneGeometry :args="[16, 16]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <template #overlay>
      <div class="hud">
        <div class="hud__row">
          <span class="badge parent"> Parent pos: ({{ parentPos.x }}, {{ parentPos.y }}) </span>
        </div>
        <div class="hud__row">
          <span class="badge child-a">
            Child A parent: {{ childAParentId !== null ? `eid ${childAParentId}` : "none" }}
          </span>
          <span class="badge child-b">
            Child B parent: {{ childBParentId !== null ? `eid ${childBParentId}` : "none" }}
          </span>
        </div>
        <div class="hud__row">
          <span class="pill">Blue = parent | Orange = child A | Green = child B</span>
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

.badge.parent {
  border: 1px solid rgba(68, 170, 255, 0.5);
  color: rgba(68, 170, 255, 0.9);
  background: rgba(68, 170, 255, 0.1);
}

.badge.child-a {
  border: 1px solid rgba(255, 136, 68, 0.5);
  color: rgba(255, 136, 68, 0.9);
  background: rgba(255, 136, 68, 0.1);
}

.badge.child-b {
  border: 1px solid rgba(68, 255, 136, 0.5);
  color: rgba(68, 255, 136, 0.9);
  background: rgba(68, 255, 136, 0.1);
}
</style>
