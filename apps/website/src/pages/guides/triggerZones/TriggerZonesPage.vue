<script setup lang="ts">
import TriggerZonesGame from "./TriggerZonesGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./TriggerZonesScene.vue?raw";

const BASIC = `import { defineTag, useEcsComponent, createTriggerZone } from "@dumas/core";

const PlayerTag = defineTag();

// Player entity — just needs a tag, no physics required.
const { eid: playerEid } = useEcsComponent({
  components: { player: PlayerTag },
});

// Trigger zone entity — fires callbacks based on transform distance.
const { eid: zoneEid } = useEcsComponent({
  components: {
    trigger: createTriggerZone({
      radius: 2,
      target: [PlayerTag],
      onEnter({ targetEid, zoneEid }) {
        showPrompt("Press E to interact");
      },
      onExit({ targetEid, zoneEid }) {
        hidePrompt();
      },
    }),
  },
});`;

const MULTI_TAG = `const EnemyTag = defineTag();
const NpcTag = defineTag();

// This zone triggers for both enemies and NPCs.
const { eid: alertZoneEid } = useEcsComponent({
  components: {
    trigger: createTriggerZone({
      radius: 5,
      target: [EnemyTag, NpcTag],
      onEnter({ targetEid }) {
        alertNearby({ eid: targetEid });
      },
    }),
  },
});`;

const VS_SENSOR = `// useSensor — requires a physics world (usePhysics) and a sensor collider.
// Uses Rapier's broadphase for overlap detection.
useSensor({
  eid: zoneEid,
  collider: "zone",
  onEnter() { /* ... */ },
});

// createTriggerZone — no physics needed.
// Checks distance between transform positions each frame.
createTriggerZone({
  radius: 2,
  target: [PlayerTag],
  onEnter() { /* ... */ },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <TriggerZonesGame />
    </template>

    <h1>Trigger Zones</h1>
    <p>
      Trigger zones provide proximity-based enter/exit detection without requiring a physics world.
      They check the distance between entity transform positions each frame and fire callbacks when
      a target entity enters or leaves the configured radius.
    </p>
    <p>
      Every entity automatically has a transform, so any entity can participate in trigger zone
      checks with no additional setup. Use <code>defineTag()</code> to tag entities that should be
      detected, then pass those tags to <code>createTriggerZone</code> via the
      <code>target</code> array.
    </p>

    <h2>Basic trigger zone</h2>
    <p>
      Create a tag for the entities you want to detect, then attach
      <code>createTriggerZone</code> as a component on the zone entity. The <code>radius</code>
      defines the detection sphere around the zone entity's transform position.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC" />
    </div>

    <h2>Multiple target tags</h2>
    <p>
      The <code>target</code> array accepts multiple tags or component factories. The zone will
      trigger for any entity that carries at least one of the listed components.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="MULTI_TAG" />
    </div>

    <h2>Trigger zones vs. useSensor</h2>
    <p>
      <code>useSensor</code> relies on Rapier physics sensor colliders and requires
      <code>usePhysics()</code> in the scene. It is the right choice when you already have a physics
      world and need collider-shape overlap detection (boxes, capsules, complex meshes).
    </p>
    <p>
      <code>createTriggerZone</code> needs no physics at all. It performs a simple sphere-distance
      check against transform positions, making it lighter and suitable for scenes that do not use
      physics or for interactions where a spherical radius is sufficient.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="VS_SENSOR" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
