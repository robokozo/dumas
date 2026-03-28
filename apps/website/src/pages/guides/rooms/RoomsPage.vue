<script setup lang="ts">
import RoomsGame from "./RoomsGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import roomsGameSource from "./RoomsGame.vue?raw";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <RoomsGame />
    </template>

    <h1>Room Navigation</h1>
    <p>
      Three rooms connected side-by-side. The capsule character spawns at the door it walked through
      — not always at the center. This pattern is the foundation of Zelda-style dungeon traversal:
      scene transitions carry positional context so the world feels spatially consistent.
    </p>

    <h2>Entry direction</h2>
    <p>
      A single <code>entryPoint</code> ref tracks which side of the room the player is arriving
      from. It is set <em>before</em> calling <code>loadScene()</code>, so the incoming scene reads
      the correct value the moment it renders. All three scenes share the same ref because they live
      in the same component — no additional state management needed.
    </p>

    <h2>Overlay slots at two levels</h2>
    <p>
      The room name in the top-left comes from each <code>&lt;Scene #overlay&gt;</code> — it is
      per-scene and swaps automatically on transition. The navigation HUD at the bottom comes from
      <code>&lt;Game #overlay&gt;</code> and receives <code>activeScene</code>, <code>scenes</code>,
      and <code>loadScene</code> as slot props — it persists across all scenes and drives
      transitions without needing <code>useGame()</code>.
    </p>

    <div class="code-wrap">
      <CodeBlock :code="roomsGameSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
