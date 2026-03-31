<script setup lang="ts">
import TowerDefenseGame from "./TowerDefenseGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <TowerDefenseGame />
    </template>

    <h1>Tower Defense</h1>
    <p>
      A small tower defense game built with the Dumas engine. Enemies spawn on the left and walk
      toward the goal on the right. Place towers along the path to intercept them. Towers
      automatically detect enemies within range and fire projectiles to destroy them.
    </p>

    <h2>Controls</h2>
    <ul>
      <li>Click the <strong>Place Tower</strong> buttons to build towers at preset slots</li>
      <li>Each tower costs <code>1 gold</code> to place</li>
      <li>
        Earn <code>1 gold</code> per enemy destroyed, plus <code>2 bonus gold</code> between waves
      </li>
      <li>Enemies that reach the goal cost you <code>1 life</code></li>
    </ul>

    <h2>What it demonstrates</h2>
    <ul>
      <li><code>createTriggerZone</code> for proximity-based enemy detection without physics</li>
      <li>
        <code>defineTag</code> for <code>EnemyTag</code>, <code>TowerTag</code>, and
        <code>ProjectileTag</code> archetype filtering
      </li>
      <li>
        <code>ChildOf</code> and <code>useRelationship</code> to attach turret heads to tower bases
      </li>
      <li>
        <code>useSystem</code> for the main game loop: spawning, movement, firing, and hit detection
      </li>
      <li><code>useEcsComponent</code> for entity creation with automatic transform management</li>
      <li>
        Dynamic entity creation and destruction via Vue reactivity (v-for with shallowRef arrays)
      </li>
      <li>Overlay HUD using the Scene <code>#overlay</code> slot for game state display</li>
    </ul>

    <h2>Architecture</h2>
    <p>
      The game is split into several Vue SFCs, each encapsulating a game entity type. The main scene
      component (<code>TowerDefenseScene.vue</code>) orchestrates spawning, movement, and combat
      through a single <code>useSystem</code> call that reads and writes transform stores directly.
    </p>
    <p>
      Towers use <code>createTriggerZone</code> to detect when enemies enter their radius. The
      system then rotates the turret head toward the closest enemy and spawns projectile entities
      that home in on their target. When a projectile reaches its target, the enemy takes damage and
      is removed when its health reaches zero.
    </p>
  </GuideLayout>
</template>
