<script setup lang="ts">
import CollisionGroupsGame from "./CollisionGroupsGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./CollisionGroupsScene.vue?raw";

const DEFINE = `// Define named groups — each gets a unique power-of-two bitmask.
// Up to 16 groups per game (Rapier limit).
const Groups = defineCollisionGroups(['world', 'player', 'enemy', 'projectile']);
// Groups.world      === 0b0001 (1)
// Groups.player     === 0b0010 (2)
// Groups.enemy      === 0b0100 (4)
// Groups.projectile === 0b1000 (8)`;

const USAGE = `// Player body — member of 'player', collides with world and enemies.
createPhysics({
  type: 'dynamic',
  colliders: {
    body: createCapsuleCollider({
      halfHeight: 0.5,
      radius: 0.3,
      membership: Groups.player,
      filter: Groups.world | Groups.enemy,
    }),
  },
});

// Projectile — member of 'projectile', hits world and enemies only.
// Ignores the player who fired it and other projectiles.
createPhysics({
  type: 'dynamic',
  colliders: {
    shell: createSphereCollider({
      radius: 0.1,
      membership: Groups.projectile,
      filter: Groups.world | Groups.enemy,
    }),
  },
});`;

const MULTI = `// A collider can belong to multiple groups using bitwise OR.
createCuboidCollider({
  halfExtents: [1, 1, 1],
  membership: Groups.world | Groups.enemy,  // treated as both world and enemy
  filter: Groups.player | Groups.projectile,
})`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <CollisionGroupsGame />
    </template>

    <h1>Collision Groups</h1>
    <p>
      Collision groups control which bodies interact at the physics level — before any callbacks
      fire. In the demo: red balls only land on the red platform, blue balls only on the blue
      platform, and green balls land on both. All balls pass through the wrong-color platform
      entirely.
    </p>
    <p>
      This is more efficient than filtering in callbacks because Rapier skips the narrow-phase
      entirely for non-matching pairs.
    </p>

    <h2>defineCollisionGroups</h2>
    <p>
      Call once at module scope to generate named bitmask constants. Pass the constants into
      <code>membership</code> and <code>filter</code> on any collider config.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="DEFINE" />
    </div>

    <h2>Applying groups to colliders</h2>
    <p>
      <code>membership</code> — which group(s) this collider belongs to.<br />
      <code>filter</code> — which groups it can interact with. Two colliders only interact when each
      one's <code>membership</code> overlaps the other's <code>filter</code>.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="USAGE" />
    </div>

    <h2>Multiple memberships</h2>
    <p>
      Combine groups with bitwise OR. A collider can belong to and filter against any combination.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="MULTI" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
