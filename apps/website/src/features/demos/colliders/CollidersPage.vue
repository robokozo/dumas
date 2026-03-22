<script setup lang="ts">
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import CollidersScene from "./CollidersScene.vue";
import CollidersCode from "./CollidersScene.vue?raw";
</script>

<template>
  <DemoLayout slug="colliders">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
        <CollidersScene />
      </DumasCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>Collider</code> adds collision geometry to a rigid body. The <code>shape</code> prop
          selects the type:
        </p>
        <ul>
          <li><strong>box</strong> — uses <code>args</code> for half-extents [x, y, z]</li>
          <li><strong>sphere</strong> — uses <code>radius</code></li>
          <li><strong>capsule</strong> — uses <code>radius</code> and <code>halfHeight</code></li>
        </ul>
        <p>
          Physics properties like <code>restitution</code> (bounciness), <code>friction</code>, and
          <code>density</code> control how objects interact. The pink sphere has high restitution
          (0.9) while the blue box has low restitution (0.3).
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="CollidersCode" />
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

ul {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.8;
  padding-left: 1.25rem;
  margin: 0 0 0.5rem;
}

strong {
  color: #ccc;
}

code {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #ccc;
}
</style>
