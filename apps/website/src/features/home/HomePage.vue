<script setup lang="ts">
import { DEMOS } from "../demos/registry/demoRegistry";
</script>

<template>
  <div class="home">
    <header class="hero">
      <h1>Dumas</h1>
      <p>A declarative game engine for Vue. Explore the features below.</p>
    </header>
    <div class="grid">
      <RouterLink v-for="demo in DEMOS" :key="demo.slug" :to="`/demos/${demo.slug}`" class="card">
        <span class="feature-tag">{{ demo.feature }}</span>
        <h2>{{ demo.title }}</h2>
        <p>{{ demo.description }}</p>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 5rem 2rem 2rem;
  font-family: sans-serif;
  color: #eee;
  background: #111;
  min-height: 100vh;
  max-width: 900px;
  margin: 0 auto;
}

.hero {
  margin-bottom: 2.5rem;
}

.hero h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.hero p {
  color: #888;
  font-size: 1rem;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.card {
  display: block;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 1.25rem;
  text-decoration: none;
  color: #ddd;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.card:hover {
  border-color: rgba(68, 170, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}

.feature-tag {
  display: inline-block;
  background: rgba(68, 170, 255, 0.15);
  color: #4af;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card h2 {
  font-size: 1.1rem;
  margin: 0 0 0.4rem;
  color: #fff;
}

.card p {
  font-size: 0.8rem;
  color: #888;
  line-height: 1.5;
  margin: 0;
}
</style>
