<script setup lang="ts">
import UseSensorGame from "./UseSensorGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./UseSensorScene.vue?raw";

const SETUP = `// Zone entity with a sensor collider — no physics forces generated.
const { eid } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: 'fixed',
      colliders: {
        zone: createCuboidCollider({
          halfExtents: [2, 1, 2],
          sensor: true,        // sensor: true — overlaps only, no collision response
        }),
      },
    }),
  },
});`;

const BASIC = `// Fires onEnter the frame a body first overlaps, onExit when it leaves.
// 'other' filter ensures callbacks only fire for entities with a player component.
useSensor({
  eid: zoneEid,
  collider: 'zone',
  other: { player: createPlayer },
  onEnter({ other, otherEid }) {
    saveCheckpoint({ position: other.player.spawnPoint.value });
    showBanner('Checkpoint reached');
  },
  onExit({ otherEid }) {
    hideBanner();
  },
});`;

const AOE = `// Damage zone — no filter, hits anything with health.
useSensor({
  eid: fireZoneEid,
  other: { health: createHealth },
  onEnter({ other }) {
    other.health.current.value -= 20;
  },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseSensorGame />
    </template>

    <h1>useSensor</h1>
    <p>
      Sensor colliders detect overlaps without generating contact forces. Use
      <code>useSensor</code> to fire callbacks when another body enters or exits the volume. Move
      the ball into the green zone in the demo to see it light up — WASD or arrow keys.
    </p>
    <p>
      The collider must be declared with <code>sensor: true</code> in <code>createPhysics</code>.
      The <code>other</code> component filter ensures callbacks only fire for entities that carry
      all the required components.
    </p>

    <h2>Create a sensor collider</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="SETUP" />
    </div>

    <h2>Listen for overlaps</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC" />
    </div>

    <h2>Area-of-effect damage zone</h2>
    <p>
      Omit the <code>collider</code> filter to match all sensor colliders on the entity. Omit
      specific <code>other</code> components to match any overlapping body.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="AOE" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
