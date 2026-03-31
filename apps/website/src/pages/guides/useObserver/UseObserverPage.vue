<script setup lang="ts">
import UseObserverGame from "./UseObserverGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./UseObserverScene.vue?raw";

const BASIC = `// Fires once each time an entity gains ALL of the declared components.
useObserver({
  components: [healthStore, enemyStore],
  onAdd: ({ eid }) => {
    spawnSpawnEffect(eid);
    spatialGrid.insert(eid);
  },
  onRemove: ({ eid }) => {
    spatialGrid.remove(eid);
    spawnDeathEffect(eid);
  },
});`;

const GET_STORE = `// useObserver takes raw ComponentStore instances — not factories.
// Get the store from storeRegistry after your entities have mounted.
const { storeRegistry } = useGame();

// Get the physics store (PHYSICS_TYPE is exported for internal use).
// More commonly you'd use a custom component's store:
const myStore = storeRegistry.get(createMyComponent.__type);

useObserver({
  components: [myStore],
  onAdd: ({ eid }) => { ... },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseObserverGame />
    </template>

    <h1>Entity Observers</h1>
    <p>
      Fires a callback once each time an entity enters or leaves an archetype — when it gains or
      loses all of the declared components. The log in the demo updates entirely from the observer:
      no polling, no watchers on a reactive array.
    </p>
    <p>
      Unlike systems (which run every frame), observers fire exactly once per transition. Cleaned up
      automatically on unmount.
    </p>

    <h2>Basic usage</h2>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="BASIC" />
    </div>

    <h2>Getting stores</h2>
    <p>
      <code>useObserver</code> takes raw <code>ComponentStore</code> instances, not factories.
      Retrieve them from <code>storeRegistry</code> after entities have mounted.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="GET_STORE" />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
