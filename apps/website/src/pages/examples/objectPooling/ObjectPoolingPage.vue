<script setup lang="ts">
import { ref } from "vue";
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import ObjectPoolingScene from "./ObjectPoolingScene.vue";
import ObjectPoolingCode from "./ObjectPoolingScene.vue?raw";

const POOL_SIZE = 5;

const spawnCount = ref<number>(0);
const available = ref<number>(POOL_SIZE);
const active = ref<number>(0);

function handleSpawn(): void {
  spawnCount.value++;
}

function handlePoolUpdate({
  available: a,
  active: ac,
}: {
  available: number;
  active: number;
}): void {
  available.value = a;
  active.value = ac;
}
</script>

<template>
  <DemoLayout slug="object-pooling">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
        <ObjectPoolingScene :spawn-count="spawnCount" @pool-update="handlePoolUpdate" />
      </DumasCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>useObjectPool</code> pre-allocates a fixed number of entities with physics bodies.
          Instead of creating and destroying objects, you <code>acquire()</code> from the pool and
          <code>release()</code> back to it.
        </p>
        <p>
          Pooled objects are parked off-screen when inactive. This avoids garbage collection
          pressure and expensive physics body creation at runtime.
        </p>
      </section>
      <section>
        <div class="controls">
          <button @click="handleSpawn">Spawn Ball</button>
          <div class="stats">
            <span>Available: {{ available }}</span>
            <span>Active: {{ active }}</span>
          </div>
        </div>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="ObjectPoolingCode" />
      </section>
    </template>
  </DemoLayout>
</template>

<style scoped>
section {
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 0.5rem;
}

p {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0 0 0.5rem;
}

code {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #ccc;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

button {
  background: #4af;
  color: #111;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}

button:hover {
  background: #5bf;
}

.stats {
  display: flex;
  gap: 1rem;
  color: #888;
  font-size: 0.8rem;
  font-family: monospace;
}
</style>
