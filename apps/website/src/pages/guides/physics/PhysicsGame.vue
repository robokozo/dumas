<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";
import { Game, Physics, RigidBody, Scene } from "@dumas/core";

interface Box {
  id: number;
  position: [number, number, number];
  color: string;
}

const BOXES: Array<Box> = [
  { id: 1, position: [-4, 3, 0.5], color: "#ff6b6b" },
  { id: 2, position: [-2.5, 6, -0.5], color: "#ff8e53" },
  { id: 3, position: [-1, 9, 0.3], color: "#ffe66d" },
  { id: 4, position: [0.5, 12, -0.3], color: "#4ecdc4" },
  { id: 5, position: [2, 15, 0.4], color: "#a8e6cf" },
  { id: 6, position: [3.5, 18, -0.2], color: "#c9b1ff" },
  { id: 7, position: [-3, 4, 1.2], color: "#ff6b9d" },
  { id: 8, position: [1, 8, -1.2], color: "#44aaff" },
  { id: 9, position: [3, 11, 1], color: "#88ff88" },
];
</script>

<template>
  <Game style="width: 100%; height: 100%">
    <Scene name="main" :default="true">
      <TresPerspectiveCamera :position="[0, 10, 22]" :look-at="[0, 5, 0]" />
      <OrbitControls />
      <TresDirectionalLight :position="[5, 10, 5]" :intensity="2" />
      <TresAmbientLight :intensity="0.5" />

      <Suspense>
        <Physics :gravity="[0, -9.81, 0]">
          <!-- Static ground — rotated plane so boxes land on the surface -->
          <RigidBody type="fixed">
            <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
              <TresPlaneGeometry :args="[20, 20]" />
              <TresMeshStandardMaterial color="#2a2a2a" :side="2" />
            </TresMesh>
          </RigidBody>

          <!-- Boxes staggered at increasing heights — position on the mesh sets
               the collider offset from the body origin, which is the intended API -->
          <RigidBody v-for="box in BOXES" :key="box.id" type="dynamic">
            <TresMesh :position="box.position">
              <TresBoxGeometry :args="[1, 1, 1]" />
              <TresMeshStandardMaterial :color="box.color" />
            </TresMesh>
          </RigidBody>
        </Physics>
      </Suspense>
    </Scene>
  </Game>
</template>
