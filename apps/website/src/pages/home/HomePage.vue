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
          <h3>ECS Components</h3>
          <p>
            Attach ECS components to an entity and co-locate per-frame behavior alongside the
            registration.
          </p>
        </RouterLink>
        <RouterLink to="/guides/use-input" class="card">
          <div class="feature-tag">Input</div>
          <h3>Input</h3>
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
        <RouterLink to="/guides/object-pooling" class="card">
          <div class="feature-tag">ECS</div>
          <h3>Object Pooling</h3>
          <p>
            Pre-allocate entities and recycle them with usePool and ObjectPool. Zero mount overhead
            for projectiles and particles.
          </p>
        </RouterLink>
        <RouterLink to="/guides/use-collision" class="card">
          <div class="feature-tag">Physics</div>
          <h3>Collision Events</h3>
          <p>
            Per-collider callbacks on createPhysics close over reactive state — no separate
            composable needed for simple cases.
          </p>
        </RouterLink>
        <RouterLink to="/guides/use-collision-ecs" class="card">
          <div class="feature-tag">Physics</div>
          <h3>ECS Collision Filtering</h3>
          <p>
            ECS-filtered collision composable. Callbacks only fire when both entities carry the
            required components — pre-sliced reactive data passed directly.
          </p>
        </RouterLink>
        <RouterLink to="/guides/use-sensor" class="card">
          <div class="feature-tag">Physics</div>
          <h3>Trigger Volumes</h3>
          <p>
            Detect when bodies enter or exit a trigger volume. Core primitive for pickups, damage
            zones, and checkpoints.
          </p>
        </RouterLink>
        <RouterLink to="/guides/use-raycast" class="card">
          <div class="feature-tag">Physics</div>
          <h3>Raycasting</h3>
          <p>
            Cast rays against the physics world with ECS target filtering. Returns the nearest hit
            or all hits with pre-sliced component data.
          </p>
        </RouterLink>
        <RouterLink to="/guides/collision-groups" class="card">
          <div class="feature-tag">Physics</div>
          <h3>Collision Groups</h3>
          <p>
            Control which bodies interact at the physics level with named bitmask groups. More
            efficient than filtering in callbacks.
          </p>
        </RouterLink>
        <RouterLink to="/guides/use-observer" class="card">
          <div class="feature-tag">ECS</div>
          <h3>Entity Observers</h3>
          <p>
            Fire a callback once when an entity enters or leaves an archetype. Useful for spatial
            grid registration and one-shot spawn effects.
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

    <section class="section">
      <h2>Game Demos</h2>
      <p class="section-desc">Complete games built with Dumas.</p>
      <div class="grid">
        <RouterLink to="/games/coin-pusher" class="card card--demo">
          <div class="feature-tag feature-tag--demo">Game</div>
          <h3>Coin Pusher</h3>
          <p>
            Arcade coin pusher. Move left/right and press space to drop coins — push the pile off
            the edge to score.
          </p>
        </RouterLink>
        <RouterLink to="/games/adventure" class="card card--demo">
          <div class="feature-tag feature-tag--demo">Game</div>
          <h3>Point & Click Adventure</h3>
          <p>
            Click to move, click objects to interact. Three items with branching dialogue, proximity
            detection, and a modal interaction menu.
          </p>
        </RouterLink>
        <RouterLink to="/games/dungeon" class="card card--demo">
          <div class="feature-tag feature-tag--demo">Game</div>
          <h3>Dungeon Explorer</h3>
          <p>
            Zelda-style top-down movement with WASD and gamepad. Walk into the cave to trigger a
            scene transition with spawn positioning.
          </p>
        </RouterLink>
        <RouterLink to="/games/dyson" class="card card--demo">
          <div class="feature-tag feature-tag--demo">Game</div>
          <h3>Dyson Swarm</h3>
          <p>
            Idle clicker in space. Click the sun for energy, build orbital collectors and stations
            that generate passive income.
          </p>
        </RouterLink>
        <RouterLink to="/games/quick-drop" class="card card--demo">
          <div class="feature-tag feature-tag--demo">Game</div>
          <h3>Quick Drop</h3>
          <p>
            Arcade timing game. Drop balls onto a spinning turntable and score points based on which
            colored section they land on.
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
