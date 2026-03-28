<script setup lang="ts">
import UseEcsComponentGame from "./UseEcsComponentGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import orbitingCubeSource from "./OrbitingCube.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseEcsComponentGame />
    </template>

    <h1>useEcsComponent</h1>
    <p>
      <code>useEcsComponent({ eid, components })</code> registers one or more bitECS components on
      an entity. Components are added when the composable is called and removed automatically when
      the component unmounts.
    </p>

    <h2>Per-entity behavior</h2>
    <p>
      Pass an optional <code>fn</code> callback to co-locate per-frame logic with the component
      registration. The callback closes over <code>eid</code> and runs every frame — no separate
      <code>useSystem</code> call needed. Use this when the behavior belongs exclusively to one
      entity.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="orbitingCubeSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
