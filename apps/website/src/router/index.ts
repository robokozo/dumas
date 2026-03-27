import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomePage from "../pages/home/HomePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/guides/world-setup",
    component: () => import("../pages/guides/worldSetup/WorldSetupPage.vue"),
  },
  {
    path: "/guides/rigid-body",
    component: () => import("../pages/guides/rigidBody/RigidBodyPage.vue"),
  },
  {
    path: "/guides/colliders",
    component: () => import("../pages/guides/colliders/CollidersPage.vue"),
  },
  {
    path: "/guides/collision-events",
    component: () => import("../pages/guides/collisionEvents/CollisionEventsPage.vue"),
  },
  {
    path: "/guides/custom-systems",
    component: () => import("../pages/guides/customSystems/CustomSystemsPage.vue"),
  },
  {
    path: "/guides/joints",
    component: () => import("../pages/guides/joints/JointsPage.vue"),
  },
  {
    path: "/guides/object-pooling",
    component: () => import("../pages/guides/objectPooling/ObjectPoolingPage.vue"),
  },
  {
    path: "/guides/player-input",
    component: () => import("../pages/guides/input/InputPage.vue"),
  },
  {
    path: "/guides/character-controller",
    component: () => import("../pages/guides/characterController/CharacterControllerPage.vue"),
  },
  {
    path: "/guides/3d-models",
    component: () => import("../pages/guides/spellAndSteel/SpellAndSteelPage.vue"),
  },
  {
    path: "/demos/cannon-wall",
    component: () => import("../pages/demos/cannonWall/CannonWallPage.vue"),
  },
  {
    path: "/demos/platformer",
    component: () => import("../pages/demos/platformer/PlatformerPage.vue"),
  },
  {
    path: "/demos/isometric",
    component: () => import("../pages/demos/isometric/IsometricPage.vue"),
  },
  {
    path: "/demos/dialog-demo",
    component: () => import("../pages/demos/dialogDemo/DialogDemoPage.vue"),
  },
  {
    path: "/demos/dyson-swarm",
    component: () => import("../pages/demos/dysonSwarm/DysonSwarmPage.vue"),
  },
  {
    path: "/demos/ball-dropper",
    component: () => import("../pages/demos/ballDropper/BallDropperPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: "/", component: HomePage }, ...routes],
});
