<script setup lang="ts">
import { DEMOS } from "../examples/registry/demoRegistry";
import { SAMPLES } from "../samples/registry/sampleRegistry";
</script>

<template>
  <div class="home">
    <header class="hero">
      <h1>Dumas</h1>
      <p>A declarative game engine for Vue. Explore the features below.</p>
    </header>

    <section class="section section--name">
      <h2>Why "Dumas"?</h2>
      <p>
        Named after Alexandre Dumas, author of <em>The Three Musketeers</em> — a nod to the three
        TresJS libraries the engine is built with:
        <a href="https://tresjs.org" target="_blank" rel="noopener">Tres</a>,
        <a href="https://cientos.tresjs.org" target="_blank" rel="noopener">Cientos</a>, and
        <a href="https://leches.tresjs.org" target="_blank" rel="noopener">TresLeches</a>.
      </p>
    </section>

    <section class="section">
      <h2>API Examples</h2>
      <p class="section-desc">Focused demos — one composable or concept per example.</p>
      <div class="grid">
        <RouterLink
          v-for="demo in DEMOS"
          :key="demo.slug"
          :to="`/examples/${demo.slug}`"
          class="card"
        >
          <span class="feature-tag">{{ demo.feature }}</span>
          <h3>{{ demo.title }}</h3>
          <p>{{ demo.description }}</p>
        </RouterLink>
      </div>
    </section>

    <section class="section">
      <h2>Game Samples</h2>
      <p class="section-desc">Complete mini-games combining multiple engine features.</p>
      <div class="grid">
        <RouterLink
          v-for="sample in SAMPLES"
          :key="sample.slug"
          :to="`/samples/${sample.slug}`"
          class="card card--sample"
        >
          <h3>{{ sample.title }}</h3>
          <p>{{ sample.description }}</p>
        </RouterLink>
      </div>
    </section>
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
  margin-bottom: 3rem;
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

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 0.25rem;
}

.section--name p {
  color: #888;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0.25rem 0 0;
}

.section--name a {
  color: #4af;
  text-decoration: none;
}

.section--name a:hover {
  text-decoration: underline;
}

.section-desc {
  color: #666;
  font-size: 0.8rem;
  margin: 0 0 1rem;
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

.card--sample:hover {
  border-color: rgba(100, 255, 150, 0.3);
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

.card h3 {
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
