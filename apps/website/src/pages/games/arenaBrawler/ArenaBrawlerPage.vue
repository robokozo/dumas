<script setup lang="ts">
import ArenaBrawlerGame from "./ArenaBrawlerGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <ArenaBrawlerGame />
    </template>

    <h1>Arena Brawler</h1>
    <p>
      A top-down arena combat game. Fight waves of enemies using melee attacks. Defeat all enemies
      to win, or lose all your health and fall in battle.
    </p>

    <h2>How to play</h2>
    <ul>
      <li><strong>WASD / Arrow keys</strong> — move your character around the arena</li>
      <li><strong>Space</strong> — swing your weapon to deal damage to nearby enemies</li>
      <li><strong>Avoid enemies</strong> — contact with enemies drains your health</li>
      <li><strong>Defeat all enemies</strong> — reduce their health to zero to win</li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      The player and enemies are each ECS entities created with <code>useEcsComponent</code>. The
      weapon is a child entity linked to the player via the <code>ChildOf</code> relation using
      <code>useRelationship</code>.
    </p>
    <p>
      Enemy AI uses <code>useEntityRef</code> to read the player's transform every frame and chase
      them. Proximity-based damage uses <code>createTriggerZone</code> with
      <code>PlayerTag</code> and <code>EnemyTag</code> filters created by <code>defineTag</code>.
    </p>
    <p>
      Floating health bars are positioned with <code>useWorldToScreen</code>, projecting each
      entity's 3D position to screen-space coordinates for DOM overlay elements. Player input is
      handled by <code>defineInputMap</code> and <code>useInput</code> with keyboard and gamepad
      support.
    </p>
  </GuideLayout>
</template>
