<script setup lang="ts">
/**
 * Demo: defineTag creates zero-field ECS tags for archetype filtering.
 *
 * Green cubes are tagged "Friendly". Red cubes are tagged "Enemy".
 * A system queries only Enemy-tagged entities and spins them.
 * Friendly cubes stay still — the system ignores them.
 */
import { Scene, useEcsComponent, useSystem, defineTag, DumasEntity } from "@dumas/core";
import { createTransform, TRANSFORM_TYPE } from "@dumas/core";
import type { TransformStore } from "@dumas/core";
import { useGame } from "@dumas/core";

const FriendlyTag = defineTag();
const EnemyTag = defineTag();

const { storeRegistry } = useGame();

// ── Friendly cubes (green, static) ──────────────────────────────────────────

const friendly1 = useEcsComponent({ components: { tag: FriendlyTag } });
friendly1.transform.posX.value = -3;

const friendly2 = useEcsComponent({ components: { tag: FriendlyTag } });
friendly2.transform.posX.value = -1;

// ── Enemy cubes (red, spinning) ─────────────────────────────────────────────

const enemy1 = useEcsComponent({ components: { tag: EnemyTag } });
enemy1.transform.posX.value = 1;

const enemy2 = useEcsComponent({ components: { tag: EnemyTag } });
enemy2.transform.posX.value = 3;

// ── System that only affects enemies ────────────────────────────────────────

const enemyStore = storeRegistry.get(EnemyTag.__type!)!;

useSystem({
  components: [enemyStore],
  fn: ({ entities, elapsed }) => {
    const transformStore = storeRegistry.get(TRANSFORM_TYPE) as TransformStore | undefined;
    if (transformStore === undefined) return;

    for (const eid of entities) {
      transformStore.rotY[eid].value = Math.sin(elapsed * 2 + eid) * 0.5;
    }
  },
});
</script>

<template>
  <Scene name="define-tag-demo" :default="true">
    <TresPerspectiveCamera :position="[0, 4, 8]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.5" />

    <!-- Friendly cubes (green) -->
    <DumasEntity :eid="friendly1.eid">
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#44cc44" />
      </TresMesh>
    </DumasEntity>

    <DumasEntity :eid="friendly2.eid">
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#44cc44" />
      </TresMesh>
    </DumasEntity>

    <!-- Enemy cubes (red, spinning) -->
    <DumasEntity :eid="enemy1.eid">
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#cc4444" />
      </TresMesh>
    </DumasEntity>

    <DumasEntity :eid="enemy2.eid">
      <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshStandardMaterial color="#cc4444" />
      </TresMesh>
    </DumasEntity>

    <template #overlay>
      <div class="legend">
        <span class="friendly">Green = Friendly (no spin)</span>
        <span class="enemy">Red = Enemy (spinning)</span>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.legend {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1.5rem;
  font-family: sans-serif;
  font-size: 0.75rem;
  pointer-events: none;
}
.friendly {
  color: #44cc44;
}
.enemy {
  color: #cc4444;
}
</style>
