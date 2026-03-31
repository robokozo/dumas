<script setup lang="ts">
import UseRaycastGame from "./UseRaycastGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./UseRaycastScene.vue?raw";

const BASIC = `const { cast } = useRaycast({
  eid: tankEid,
  source: { weapon: createWeapon },  // pre-sliced from the casting entity
  target: { health: createHealth },  // only entities with health are hittable
});

function fire() {
  // origin defaults to the casting entity's current transform position
  const hit = cast({ direction: aimDir, maxDistance: 500 });
  if (hit === null) return;

  hit.target.health.current.value -= hit.source.weapon.damage.value;
  spawnDecal({ position: hit.point, normal: hit.normal });
}`;

const CAST_ALL = `// castAll returns every matching hit in distance order.
const { castAll } = useRaycast({ eid, target: { enemy: createEnemy } });

const hits = castAll({ direction: forward, maxDistance: 100 });
for (const hit of hits) {
  hit.target.enemy.alerted.value = true;
}`;

const GROUND_CHECK = `// Ground detection — no source or target filter needed.
const { cast } = useRaycast({ eid: playerEid });

const hit = cast({ direction: { x: 0, y: -1, z: 0 }, maxDistance: 1.1 });
isGrounded.value = hit !== null;`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseRaycastGame />
    </template>

    <h1>Raycasting</h1>
    <p>
      Casts a ray against the physics world and returns hit results filtered by ECS components. The
      demo shows a rotating laser from the center — the target it hits lights up orange each frame.
    </p>

    <h2>cast — nearest hit</h2>
    <p>
      Returns the nearest matching hit or <code>null</code>. Call it any time — from a system, input
      handler, or collision callback.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC" />
    </div>

    <h2>castAll — every hit</h2>
    <p>Returns every matching hit sorted by distance ascending.</p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="CAST_ALL" />
    </div>

    <h2>Ground detection</h2>
    <p>Omit <code>source</code> and <code>target</code> to cast against everything.</p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="GROUND_CHECK" />
    </div>

    <h2>Hit result fields</h2>
    <div class="code-wrap">
      <CodeBlock
        lang="ts"
        :code="`hit.source     // SlicedComponents — reactive fields for the casting entity
hit.target     // SlicedComponents — reactive fields for the hit entity
hit.point      // Vec3 — world-space hit point
hit.normal     // Vec3 — world-space surface normal
hit.distance   // number — distance from origin to hit
hit.collider   // Rapier Collider
hit.targetEid  // number — bitECS entity ID of the hit entity`"
      />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
