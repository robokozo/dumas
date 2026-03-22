<script setup lang="ts">
import { DumasCanvas } from "@dumas/core";
import DemoLayout from "../layout/DemoLayout.vue";
import CodeBlock from "../layout/CodeBlock.vue";
import CollisionEventsScene from "./CollisionEventsScene.vue";
import CollisionBallCode from "./CollisionBall.vue?raw";
</script>

<template>
  <DemoLayout slug="collision-events">
    <template #scene>
      <DumasCanvas clear-color="#111" render-mode="always" :gravity="{ x: 0, y: -9.81, z: 0 }">
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
          <code>eidB</code>, and <code>type</code>
          ("started" or "stopped"). Use this to trigger effects, damage, sounds, or any game logic.
        </p>
        <p>
          Watch the ball turn <strong style="color: #4fa">green</strong> on contact and back to
          <strong style="color: #4af">blue</strong> when it bounces away.
        </p>
      </section>
      <section>
        <h2>Code</h2>
        <CodeBlock :code="CollisionBallCode" />
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
