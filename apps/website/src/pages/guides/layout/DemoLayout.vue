<script setup lang="ts">
import { getAdjacentDemos, getDemoBySlug } from "../registry/demoRegistry";

const props = defineProps<{
  slug: string;
}>();

const demo = getDemoBySlug({ slug: props.slug });
const { prev, next } = getAdjacentDemos({ slug: props.slug });
</script>

<template>
  <div class="demo-layout">
    <div class="scene-panel">
      <slot name="scene" />
    </div>
    <div class="content-panel">
      <div class="content-scroll">
        <header v-if="demo !== null">
          <h1>{{ demo.title }}</h1>
          <span class="feature-tag">{{ demo.feature }}</span>
          <p class="description">{{ demo.description }}</p>
        </header>

        <slot name="content" />

        <nav class="pagination">
          <RouterLink v-if="prev !== null" :to="`/guides/${prev.slug}`" class="prev">
            &larr; {{ prev.title }}
          </RouterLink>
          <span v-else />
          <RouterLink v-if="next !== null" :to="`/guides/${next.slug}`" class="next">
            {{ next.title }} &rarr;
          </RouterLink>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  width: 100%;
}

.scene-panel {
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
}

.content-panel {
  background: #111;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  overflow-y: auto;
}

.content-scroll {
  padding: 4.5rem 2rem 2rem;
  font-family: sans-serif;
  color: #ddd;
}

header {
  margin-bottom: 2rem;
}

h1 {
  font-size: 1.5rem;
  color: #fff;
  margin: 0 0 0.5rem;
}

.feature-tag {
  display: inline-block;
  background: rgba(68, 170, 255, 0.15);
  color: #4af;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.description {
  color: #999;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.pagination a {
  color: #4af;
  text-decoration: none;
  font-size: 0.9rem;
}

.pagination a:hover {
  text-decoration: underline;
}
</style>
