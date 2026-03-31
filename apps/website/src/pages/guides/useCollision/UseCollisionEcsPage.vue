<script setup lang="ts">
import UseCollisionEcsGame from "./UseCollisionEcsGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./UseCollisionEcsScene.vue?raw";

const BASIC = `// Fires only when the other entity carries all the declared 'other' components.
useCollision({
  eid: swordEid,
  self: { damage: createDamage },
  other: { health: createHealth },
  onContact({ self, other, normal, which, otherEid }) {
    other.health.current.value -= self.damage.amount.value;
    spawnSpark({ normal });
  },
  onContactEnd({ other }) {
    // fires when the two bodies separate
  },
});`;

const COLLIDER_FILTER = `// Restrict to a named collider on this entity.
useCollision({
  eid: playerEid,
  collider: 'feet',
  other: { ground: createGround },
  onContact()    { isGrounded.value = true },
  onContactEnd() { isGrounded.value = false },
});`;

const SYMMETRIC = `// Both sides must carry the same component.
useCollision({
  eid: chargeEid,
  self:  { charge: createCharge },
  other: { charge: createCharge },
  onContact({ self, other }) {
    triggerArc({ from: self.charge, to: other.charge });
  },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseCollisionEcsGame />
    </template>

    <h1>useCollision</h1>
    <p>
      A composable-level collision listener with ECS component filtering. Callbacks only fire when
      both entities carry all the declared components — no manual entity lookups needed. Pre-sliced
      reactive data is passed directly to the callback.
    </p>
    <p>
      In the demo: red balls have a <code>sword</code> tag, blue balls have a
      <code>target</code> tag. <code>useCollision</code> is registered on each target with
      <code>other: &#123; sword: createSwordTag &#125;</code>. Blue balls flash when hit by a red
      one — sword-on-sword contacts are silently ignored.
    </p>
    <p>
      This is distinct from the per-collider <code>onCollision</code> on <code>createPhysics</code>,
      which is simpler but cannot inspect the other entity's components.
    </p>

    <h2>Basic usage</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC" />
    </div>

    <h2>Collider filter</h2>
    <p>Restrict to a specific named collider on this entity.</p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="COLLIDER_FILTER" />
    </div>

    <h2>Symmetric filtering</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SYMMETRIC" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
