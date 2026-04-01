<script setup lang="ts">
import { Game, Scene } from "@dumas/core";
import SceneControls from "./SceneControls.vue";
import SceneBackground from "./SceneBackground.vue";
</script>

<template>
  <Game style="width: 100%; height: 100%">
    <!-- ── Forest ─────────────────────────────────────────────── -->
    <Scene name="forest" :default="true">
      <SceneBackground :color="[0.478, 0.722, 0.831]" />
      <TresPerspectiveCamera :position="[0, 2.5, 7]" :look-at="[0, 0.5, 0]" />
      <TresDirectionalLight :position="[3, 8, 4]" :intensity="1.8" color="#c8ecc8" />
      <TresAmbientLight :intensity="0.5" color="#a0c8a0" />

      <!-- Ground -->
      <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
        <TresPlaneGeometry :args="[14, 10]" />
        <TresMeshStandardMaterial color="#2d4a1e" />
      </TresMesh>

      <!-- Tree 1 — left, medium -->
      <TresGroup :position="[-1.8, 0, -1]">
        <TresMesh :position="[0, 0.5, 0]">
          <TresCylinderGeometry :args="[0.07, 0.09, 1.0, 8]" />
          <TresMeshStandardMaterial color="#5c3a1e" />
        </TresMesh>
        <TresMesh :position="[0, 1.0, 0]">
          <TresConeGeometry :args="[0.6, 1.0, 7]" />
          <TresMeshStandardMaterial color="#2d5a2a" />
        </TresMesh>
        <TresMesh :position="[0, 1.7, 0]">
          <TresConeGeometry :args="[0.42, 0.85, 7]" />
          <TresMeshStandardMaterial color="#336630" />
        </TresMesh>
        <TresMesh :position="[0, 2.25, 0]">
          <TresConeGeometry :args="[0.26, 0.65, 7]" />
          <TresMeshStandardMaterial color="#3a7035" />
        </TresMesh>
      </TresGroup>

      <!-- Tree 2 — right, taller -->
      <TresGroup :position="[1.6, 0, -0.8]">
        <TresMesh :position="[0, 0.6, 0]">
          <TresCylinderGeometry :args="[0.08, 0.1, 1.2, 8]" />
          <TresMeshStandardMaterial color="#5c3a1e" />
        </TresMesh>
        <TresMesh :position="[0, 1.2, 0]">
          <TresConeGeometry :args="[0.7, 1.1, 7]" />
          <TresMeshStandardMaterial color="#2d5a2a" />
        </TresMesh>
        <TresMesh :position="[0, 2.0, 0]">
          <TresConeGeometry :args="[0.5, 0.95, 7]" />
          <TresMeshStandardMaterial color="#336630" />
        </TresMesh>
        <TresMesh :position="[0, 2.65, 0]">
          <TresConeGeometry :args="[0.3, 0.7, 7]" />
          <TresMeshStandardMaterial color="#3a7035" />
        </TresMesh>
      </TresGroup>

      <!-- Tree 3 — back centre, smaller -->
      <TresGroup :position="[-0.3, 0, -2.2]">
        <TresMesh :position="[0, 0.4, 0]">
          <TresCylinderGeometry :args="[0.06, 0.08, 0.8, 8]" />
          <TresMeshStandardMaterial color="#5c3a1e" />
        </TresMesh>
        <TresMesh :position="[0, 0.8, 0]">
          <TresConeGeometry :args="[0.48, 0.85, 7]" />
          <TresMeshStandardMaterial color="#2d5a2a" />
        </TresMesh>
        <TresMesh :position="[0, 1.45, 0]">
          <TresConeGeometry :args="[0.33, 0.7, 7]" />
          <TresMeshStandardMaterial color="#336630" />
        </TresMesh>
        <TresMesh :position="[0, 1.95, 0]">
          <TresConeGeometry :args="[0.2, 0.52, 7]" />
          <TresMeshStandardMaterial color="#3a7035" />
        </TresMesh>
      </TresGroup>

      <template #overlay>
        <div class="scene-label">Forest</div>
      </template>
    </Scene>

    <!-- ── Desert ─────────────────────────────────────────────── -->
    <Scene name="desert">
      <SceneBackground :color="[0.91, 0.831, 0.627]" />
      <TresPerspectiveCamera :position="[0, 2.5, 7]" :look-at="[0, 0.5, 0]" />
      <TresDirectionalLight :position="[4, 10, 2]" :intensity="2.5" color="#ffe8a0" />
      <TresAmbientLight :intensity="0.35" color="#e8c870" />

      <!-- Ground -->
      <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
        <TresPlaneGeometry :args="[14, 10]" />
        <TresMeshStandardMaterial color="#c8a050" />
      </TresMesh>

      <!-- Cactus 1 — left, full arms -->
      <TresGroup :position="[-1.5, 0, -0.5]">
        <!-- Body -->
        <TresMesh :position="[0, 0.8, 0]">
          <TresCylinderGeometry :args="[0.13, 0.15, 1.6, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Body top dome — sphere centred at cylinder top face -->
        <TresMesh :position="[0, 1.6, 0]">
          <TresSphereGeometry :args="[0.13, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Left horizontal arm — extends 0.1 into body so it flush-connects -->
        <!-- Body surface at x=-0.15; arm from x=-0.05 to x=-0.55; centre x=-0.3 -->
        <TresMesh :position="[-0.3, 0.9, 0]" :rotation="[0, 0, Math.PI / 2]">
          <TresCylinderGeometry :args="[0.1, 0.1, 0.5, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Left elbow joint sphere -->
        <TresMesh :position="[-0.55, 0.9, 0]">
          <TresSphereGeometry :args="[0.1, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Left vertical arm — y=0.9 to y=1.4; centre y=1.15 -->
        <TresMesh :position="[-0.55, 1.15, 0]">
          <TresCylinderGeometry :args="[0.1, 0.1, 0.5, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Left arm top dome -->
        <TresMesh :position="[-0.55, 1.4, 0]">
          <TresSphereGeometry :args="[0.1, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Right horizontal arm — slightly lower for asymmetry -->
        <!-- Body surface at x=0.15; arm from x=0.05 to x=0.55; centre x=0.3 -->
        <TresMesh :position="[0.3, 0.75, 0]" :rotation="[0, 0, Math.PI / 2]">
          <TresCylinderGeometry :args="[0.1, 0.1, 0.5, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Right elbow joint sphere -->
        <TresMesh :position="[0.55, 0.75, 0]">
          <TresSphereGeometry :args="[0.1, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Right vertical arm — y=0.75 to y=1.2; centre y=0.975 -->
        <TresMesh :position="[0.55, 0.975, 0]">
          <TresCylinderGeometry :args="[0.1, 0.1, 0.45, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Right arm top dome -->
        <TresMesh :position="[0.55, 1.2, 0]">
          <TresSphereGeometry :args="[0.1, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
      </TresGroup>

      <!-- Cactus 2 — right, single left arm -->
      <TresGroup :position="[1.4, 0, -1.0]">
        <TresMesh :position="[0, 0.7, 0]">
          <TresCylinderGeometry :args="[0.11, 0.13, 1.4, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <TresMesh :position="[0, 1.4, 0]">
          <TresSphereGeometry :args="[0.11, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <!-- Left horizontal arm -->
        <TresMesh :position="[-0.27, 0.85, 0]" :rotation="[0, 0, Math.PI / 2]">
          <TresCylinderGeometry :args="[0.09, 0.09, 0.44, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <TresMesh :position="[-0.49, 0.85, 0]">
          <TresSphereGeometry :args="[0.09, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <TresMesh :position="[-0.49, 1.07, 0]">
          <TresCylinderGeometry :args="[0.09, 0.09, 0.44, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <TresMesh :position="[-0.49, 1.29, 0]">
          <TresSphereGeometry :args="[0.09, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
      </TresGroup>

      <!-- Cactus 3 — back, young / no arms -->
      <TresGroup :position="[-0.1, 0, -2.0]">
        <TresMesh :position="[0, 0.5, 0]">
          <TresCylinderGeometry :args="[0.09, 0.11, 1.0, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
        <TresMesh :position="[0, 1.0, 0]">
          <TresSphereGeometry :args="[0.09, 8, 8]" />
          <TresMeshStandardMaterial color="#4a7a3a" />
        </TresMesh>
      </TresGroup>

      <template #overlay>
        <div class="scene-label">Desert</div>
      </template>
    </Scene>

    <template #overlay>
      <SceneControls />
    </template>
  </Game>
</template>

<style scoped>
.scene-label {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
}
</style>
