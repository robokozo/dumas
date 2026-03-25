<script setup lang="ts">
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import CollisionEventsScene from "./CollisionEventsScene.vue";
import CollisionEventsCode from "./CollisionEventsScene.vue?raw";
</script>

<template>
  <DemoLayout slug="collision-events">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: 0, z: 0 }">
        <CollisionEventsScene />
      </DumasCanvas>
    </template>
    <template #content>
      <section>
        <h2>How it works</h2>
        <p>
          <code>useCollisionHandler</code> registers a callback that fires when an entity starts or
          stops touching another entity.
        </p>
        <p>
          The handler receives a <code>CollisionEvent</code> with <code>eidA</code>,
          <code>eidB</code>, and <code>type</code> ("started" or "stopped"). Compare
          <code>eidA</code> and <code>eidB</code> against known entity IDs to branch on
          <em>which</em> entity was hit and run different logic per target.
        </p>
        <p>
          Here, the ball bounces between two walls. On each collision, the handler checks
          <em>which wall</em> was hit: it turns <strong style="color: #f64">red</strong> for the
          left wall and <strong style="color: #4af">blue</strong> for the right.
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="CollisionEventsCode" />
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
</style>
