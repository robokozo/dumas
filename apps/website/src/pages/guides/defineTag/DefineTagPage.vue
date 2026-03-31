<script setup lang="ts">
import DefineTagGame from "./DefineTagGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./DefineTagScene.vue?raw";

const DEFINE = `import { defineTag } from '@dumas/core';

const PlayerTag = defineTag();
const EnemyTag  = defineTag();
const LootTag   = defineTag();`;

const ATTACH = `// Attach tags to entities — no store fields, just archetype identity.
const { eid } = useEcsComponent({
  components: { enemy: EnemyTag },
});`;

const QUERY = `// Systems can query by tag just like any other component.
const enemyStore = storeRegistry.get(EnemyTag.__type!)!;

useSystem({
  components: [enemyStore],
  fn: ({ entities, elapsed }) => {
    for (const eid of entities) {
      // Only runs for entities tagged as Enemy
    }
  },
});`;

const COLLISION = `// Tags work with useCollision's ECS filtering too.
useCollision({
  eid: swordEid,
  self:  { player: PlayerTag },
  other: { enemy: EnemyTag },
  onContact({ otherEid }) {
    // Only fires when a player-tagged entity hits an enemy-tagged entity
  },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <DefineTagGame />
    </template>

    <h1>Tags</h1>
    <p>
      <code>defineTag()</code> creates a zero-field ECS component factory — a lightweight marker
      with no data. Tags are the primary way to label entities for archetype filtering in queries,
      collision callbacks, and trigger zones.
    </p>
    <p>
      In the demo, green cubes carry <code>FriendlyTag</code> and red cubes carry
      <code>EnemyTag</code>. The system queries only <code>EnemyTag</code> entities and spins them —
      friendly cubes are completely ignored.
    </p>

    <h2>Define tags</h2>
    <p>Each call returns a unique factory backed by its own symbol.</p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="DEFINE" />
    </div>

    <h2>Attach to entities</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="ATTACH" />
    </div>

    <h2>Query by tag</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="QUERY" />
    </div>

    <h2>Use with collision filtering</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="COLLISION" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
