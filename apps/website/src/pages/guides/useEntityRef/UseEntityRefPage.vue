<script setup lang="ts">
import UseEntityRefGame from "./UseEntityRefGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import useEntityRefSceneSource from "./UseEntityRefScene.vue?raw";

const BASIC_USAGE_CODE = `import { useEcsComponent, useEntityRef } from "@dumas/core";

// Some other entity you want to observe
const player = useEcsComponent({});

// Create a reactive reference to the player's components
const playerRef = useEntityRef({ eid: player.eid });

// Read transform reactively — updates every frame
playerRef.transform.posX.value; // number
playerRef.transform.posY.value; // number`;

const LATE_SPAWN_CODE = `import { ref } from "vue";
import { useEntityRef } from "@dumas/core";

// eid starts null — the entity hasn't spawned yet
const targetEid = ref<number | null>(null);

const targetRef = useEntityRef({ eid: targetEid });

// Later, when the entity spawns:
targetEid.value = spawnedEid;

// targetRef.transform now points to the live entity`;

const HAS_TAG_CODE = `import { useEntityRef, defineTag } from "@dumas/core";

const EnemyTag = defineTag();

const ref = useEntityRef({ eid: someEid });

// Check whether the referenced entity carries a tag
if (ref.has({ tag: EnemyTag }) === true) {
  // entity is an enemy
}`;

const CUSTOM_COMPONENTS_CODE = `import { useEntityRef } from "@dumas/core";
import { createHealth } from "./components";

const ref = useEntityRef({
  eid: targetEid,
  components: { health: createHealth },
});

// Access custom component fields reactively
ref.health.current.value; // number
ref.health.max.value;     // number`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseEntityRefGame />
    </template>

    <h1>Entity References</h1>
    <p>
      <code>useEntityRef</code> gives reactive, sliced access to an existing entity's components
      without owning it. Use it when one entity needs to read another entity's state — for example,
      a follower tracking a leader, a health bar reading a player's HP, or a UI overlay displaying a
      target's position.
    </p>

    <h2>Basic usage</h2>
    <p>
      Pass the <code>eid</code> of the entity you want to observe. The returned object includes a
      reactive <code>transform</code> that updates automatically as the source entity moves.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC_USAGE_CODE" />
    </div>

    <h2>Late-spawning entities</h2>
    <p>
      The <code>eid</code> parameter accepts <code>Ref&lt;number | null&gt;</code>. When the ref is
      <code>null</code>, all sliced fields return <code>undefined</code>. Once a valid eid is
      assigned, the reference resolves automatically — no re-initialization needed.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="LATE_SPAWN_CODE" />
    </div>

    <h2>Checking tags with <code>has()</code></h2>
    <p>
      The returned <code>has</code> method checks whether the referenced entity carries a specific
      tag component. Pass the tag factory in an object: <code>has({ tag: SomeTag })</code>.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="HAS_TAG_CODE" />
    </div>

    <h2>Custom components</h2>
    <p>
      To read fields beyond <code>transform</code>, pass a <code>components</code> map of named
      factories. Each entry is sliced into reactive per-field accessors on the returned object.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="CUSTOM_COMPONENTS_CODE" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="useEntityRefSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
