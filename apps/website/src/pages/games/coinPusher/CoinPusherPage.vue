<script setup lang="ts">
import CoinPusherGame from "./CoinPusherGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <CoinPusherGame />
    </template>

    <h1>Coin Pusher</h1>
    <p>
      An arcade coin pusher built entirely with Dumas. Coins pile up on the shelf and the
      oscillating pusher sweeps them toward the edge. Any coin that falls off scores a point.
    </p>

    <h2>How to play</h2>
    <ul>
      <li><strong>A / ←</strong> — move drop point left</li>
      <li><strong>D / →</strong> — move drop point right</li>
      <li><strong>Space</strong> — drop a coin</li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      The pusher is a <code>kinematicPositionBased</code> rigid body driven by
      <code>setNextKinematicTranslation</code> each frame — physics resolves its contact with coins
      correctly without it being affected by forces itself.
    </p>
    <p>
      Coins are dynamic cylinder colliders spawned on demand. Each coin runs a per-entity
      <code>fn</code> inside <code>useEcsComponent</code> to detect when it has fallen past the
      shelf edge and emit a score event.
    </p>
    <p>
      Input is handled with <code>useInput</code> and <code>defineInputMap</code> — the drop
      cooldown is a plain mutable variable in component scope, no extra state management needed.
    </p>

    <h2>Model credits</h2>
    <ul>
      <li>
        <a href="https://poly.pizza/m/XbGSovhszf" target="_blank" rel="noopener">Gold Coin</a>
        by Zsky —
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener"
          >CC-BY 3.0</a
        >
        via Poly Pizza
      </li>
      <li>
        <a href="https://poly.pizza/m/tmptMJF092" target="_blank" rel="noopener">Silver Coin</a>
        by Zsky —
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener"
          >CC-BY 3.0</a
        >
        via Poly Pizza
      </li>
      <li>
        <a href="https://poly.pizza/m/Rnv7q9CHS7" target="_blank" rel="noopener">Copper Coin</a>
        by Zsky —
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener"
          >CC-BY 3.0</a
        >
        via Poly Pizza
      </li>
    </ul>
  </GuideLayout>
</template>
