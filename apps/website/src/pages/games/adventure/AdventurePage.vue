<script setup lang="ts">
import AdventureGame from "./AdventureGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
</script>

<template>
  <GuideLayout>
    <template #demo>
      <AdventureGame />
    </template>

    <h1>Point & Click Adventure</h1>
    <p>
      A minimal point-and-click adventure built entirely with Dumas. Click the ground to walk, click
      an object to approach and interact with it.
    </p>

    <h2>How to play</h2>
    <ul>
      <li><strong>Click ground</strong> — character walks to that point</li>
      <li>
        <strong>Click an object</strong> — character walks toward it and opens the interaction menu
      </li>
      <li><strong>Approach an object</strong> — an Interact prompt appears at the bottom</li>
    </ul>

    <h2>What it demonstrates</h2>
    <p>
      Character movement is pure ECS — <code>useEcsComponent</code> provides the transform, and a
      <code>useSystem</code> moves it toward the target each frame, writing rotation via
      <code>Math.atan2</code> so the character faces its direction of travel.
    </p>
    <p>
      Ground clicks use TresJS mesh pointer events. The intersection point is read directly from the
      event to set the movement target. Item clicks use invisible hitbox meshes with
      <code>@click.stop</code> to intercept the event before it reaches the ground plane.
    </p>
    <p>
      Proximity detection runs in a second <code>useSystem</code> each frame — no physics required.
      The modal is a plain Vue overlay slot with reactive state, keeping all interaction logic in
      component setup.
    </p>
  </GuideLayout>
</template>
