<script setup lang="ts">
import QueriesScene from "./QueriesScene.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import waveSystemSource from "./WaveSystem.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <QueriesScene />
    </template>

    <h1>useQuery</h1>
    <p>
      <code>useQuery({ components })</code> returns a <code>query</code> function that produces the
      current set of entity IDs matching all listed components. Call it inside a system for
      per-frame processing, or anywhere else for a one-off lookup.
    </p>

    <h2>When to use useQuery</h2>
    <p>
      Use <code>useQuery</code> when you need to reuse the same query across multiple systems, call
      it outside the render loop, or store the query function for later use. For the common case of
      a single inline system that iterates all matching entities, the
      <code>components</code> shorthand on <code>useSystem</code> is more concise.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="waveSystemSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
