<script setup lang="ts">
import PhysicsScene from "./PhysicsScene.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./PhysicsScene.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <PhysicsScene />
    </template>

    <h1>Physics</h1>
    <p>
      Dumas physics is powered by <code>@tresjs/rapier</code>, which wraps the Rapier physics
      engine. Drop <code>&lt;Physics&gt;</code> anywhere inside <code>&lt;World&gt;</code> to enable
      simulation for its subtree.
    </p>

    <h2>Physics</h2>
    <p>
      <code>&lt;Physics&gt;</code> creates a Rapier world and steps it every frame. The
      <code>gravity</code> prop accepts a <code>[x, y, z]</code> vector — default is
      <code>[0, -9.81, 0]</code>.
    </p>

    <h2>RigidBody</h2>
    <p>
      <code>&lt;RigidBody type="dynamic"&gt;</code> falls under gravity and reacts to collisions.
      <code>type="fixed"</code> is a static collider that never moves — use it for ground planes,
      walls, and platforms. Collider shapes are inferred automatically from child mesh geometry.
    </p>

    <h2>Initial position</h2>
    <p>
      Rapier reads the initial world transform from the parent group when the body is created. Wrap
      <code>&lt;RigidBody&gt;</code> in a <code>&lt;TresGroup :position="…"&gt;</code> to place it
      in the scene.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
