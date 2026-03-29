<script setup lang="ts"></script>

<template>
  <div class="home">
    <header class="hero">
      <h1>Dumas</h1>
      <p>A declarative game engine for Vue. Explore the features below.</p>
    </header>

    <section class="section section--name">
      <h2>Why "Dumas"?</h2>
      <p>
        Named after Alexandre Dumas, author of <em>The Three Musketeers</em> - a nod to the three
        TresJS libraries the engine is built with:
        <a href="https://tresjs.org" target="_blank" rel="noopener">Tres</a>,
        <a href="https://cientos.tresjs.org" target="_blank" rel="noopener">Cientos</a>, and
        <a href="https://leches.tresjs.org" target="_blank" rel="noopener">TresLeches</a>.
      </p>
    </section>

    <section class="section">
      <h2>Guides</h2>
      <p class="section-desc">Learn the core concepts.</p>
      <div class="grid">
        <RouterLink to="/guides/game-setup" class="card">
          <div class="feature-tag">Core</div>
          <h3>Game Setup</h3>
          <p>Mount a scene, register a system, and animate your first object.</p>
        </RouterLink>
        <RouterLink to="/guides/scene-switching" class="card">
          <div class="feature-tag">Core</div>
          <h3>Scene Switching</h3>
          <p>Transition between named scenes with loadScene() and overlay UI controls.</p>
        </RouterLink>
        <RouterLink to="/guides/use-ecs-component" class="card">
          <div class="feature-tag">ECS</div>
          <h3>useEcsComponent</h3>
          <p>
            Attach ECS components to an entity and co-locate per-frame behavior alongside the
            registration.
          </p>
        </RouterLink>
        <RouterLink to="/guides/use-input" class="card">
          <div class="feature-tag">Input</div>
          <h3>useInput</h3>
          <p>
            Map keyboard keys and gamepad buttons to named game actions. Distinguish held, pressed,
            and released states per action.
          </p>
        </RouterLink>
        <RouterLink to="/guides/physics" class="card">
          <div class="feature-tag">Physics</div>
          <h3>Physics</h3>
          <p>
            Add rigid bodies and colliders with Rapier. Dynamic objects, fixed ground planes, and
            automatic collider generation.
          </p>
        </RouterLink>
      </div>
    </section>

    <section class="section">
      <h2>Advanced Guides</h2>
      <p class="section-desc">Game-specific scenarios and patterns.</p>
      <div class="grid">
        <RouterLink to="/advanced/scene-switching" class="card card--demo">
          <div class="feature-tag feature-tag--demo">Core</div>
          <h3>Room Navigation</h3>
          <p>
            Three interconnected rooms with a capsule character that spawns at the door it entered
            through — isometric Zelda-style traversal.
          </p>
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

.card--demo:hover {
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

.feature-tag--demo {
  background: rgba(100, 220, 140, 0.15);
  color: #6dc;
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
