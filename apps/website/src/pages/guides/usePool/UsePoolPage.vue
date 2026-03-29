<script setup lang="ts">
import UsePoolGame from "./UsePoolGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import usePoolSceneSource from "./UsePoolScene.vue?raw";

const RENDER_POOL_CODE = `<ObjectPool :pool="pool" v-slot="{ transform }">
  <TresMesh :position="[transform.posX.value, transform.posY.value, 0]">
    <TresSphereGeometry :args="[0.2, 8, 8]" />
    <TresMeshStandardMaterial color="#ff6644" />
  </TresMesh>
</ObjectPool>`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UsePoolGame />
    </template>

    <h1>Object Pooling</h1>
    <p>
      Object pooling pre-allocates a fixed set of entities and recycles them instead of creating and
      destroying on every spawn. Critical for projectiles, particles, and anything that spawns
      frequently.
    </p>

    <h2>Create a pool</h2>
    <p>
      Call <code>usePool</code> inside a <code>&lt;Scene&gt;</code> component. Pass the number of
      slots and the ECS components each slot should carry.
    </p>
    <div class="code-wrap">
      <CodeBlock
        lang="ts"
        :code="`const pool = usePool({
  size: 8,
  components: { transform: createTransform },
});`"
      />
    </div>

    <h2>Render the pool</h2>
    <p>
      Drop <code>&lt;ObjectPool&gt;</code> into your scene. It renders one slot per entry, keeping
      all N Three.js objects alive and toggling <code>visible</code> automatically. The slot
      receives pre-sliced per-entity reactive data — no manual index access needed.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="vue" :code="RENDER_POOL_CODE" />
    </div>

    <h2>Acquire and release</h2>
    <p>
      Call <code>pool.acquire()</code> to claim a free slot — it returns the entity ID or
      <code>null</code> if the pool is exhausted. Call <code>pool.release({ eid })</code> to return
      it. Write initial state through <code>pool.stores</code> after acquiring.
    </p>
    <div class="code-wrap">
      <CodeBlock
        lang="ts"
        :code="`const eid = pool.acquire();
if (eid !== null) {
  pool.stores.transform.posX[eid].value = spawnX;
  pool.stores.transform.posY[eid].value = spawnY;
}

// Later, when done:
pool.release({ eid });`"
      />
    </div>

    <h2>Updating active slots</h2>
    <p>
      Iterate <code>pool.slots</code> in your per-frame logic, skip inactive slots, and update
      component data directly. Active slot count is reactive — read it anywhere in the template.
    </p>
    <div class="code-wrap">
      <CodeBlock
        lang="ts"
        :code="`useInput({
  map: INPUT_MAP,
  fn: ({ delta }) => {
    for (const slot of pool.slots) {
      if (slot.isActive.value === false) continue;
      pool.stores.transform.posY[slot.eid].value += velocity * delta;
    }
  },
});`"
      />
    </div>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="usePoolSceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
