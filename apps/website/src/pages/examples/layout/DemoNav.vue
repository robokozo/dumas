<script setup lang="ts">
import { DEMOS } from "../registry/demoRegistry";

defineProps<{
  currentSlug: string;
}>();
</script>

<template>
  <nav class="demo-nav">
    <RouterLink
      v-for="demo in DEMOS"
      :key="demo.slug"
      :to="`/examples/${demo.slug}`"
      :class="{ active: demo.slug === currentSlug }"
    >
      <span class="title">{{ demo.title }}</span>
      <span class="feature">{{ demo.feature }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.demo-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.demo-nav a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  color: #aaa;
  font-size: 0.8rem;
  transition:
    background 0.15s,
    color 0.15s;
}

.demo-nav a:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #eee;
}

.demo-nav a.active {
  background: rgba(68, 170, 255, 0.1);
  color: #4af;
}

.title {
  font-weight: 500;
}

.feature {
  font-size: 0.7rem;
  opacity: 0.6;
}
</style>
