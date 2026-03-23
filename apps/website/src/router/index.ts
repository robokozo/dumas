import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomePage from "../pages/home/HomePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/examples/world-setup",
    component: () => import("../pages/examples/worldSetup/WorldSetupPage.vue"),
  },
  {
    path: "/examples/rigid-body",
    component: () => import("../pages/examples/rigidBody/RigidBodyPage.vue"),
  },
  {
    path: "/examples/colliders",
    component: () => import("../pages/examples/colliders/CollidersPage.vue"),
  },
  {
    path: "/examples/collision-events",
    component: () => import("../pages/examples/collisionEvents/CollisionEventsPage.vue"),
  },
  {
    path: "/examples/custom-systems",
    component: () => import("../pages/examples/customSystems/CustomSystemsPage.vue"),
  },
  {
    path: "/examples/joints",
    component: () => import("../pages/examples/joints/JointsPage.vue"),
  },
  {
    path: "/examples/object-pooling",
    component: () => import("../pages/examples/objectPooling/ObjectPoolingPage.vue"),
  },
  {
    path: "/examples/player-input",
    component: () => import("../pages/examples/input/InputPage.vue"),
  },
  {
    path: "/examples/character-controller",
    component: () => import("../pages/examples/characterController/CharacterControllerPage.vue"),
  },
  {
    path: "/samples/cannon-wall",
    component: () => import("../pages/samples/cannonWall/CannonWallPage.vue"),
  },
  {
    path: "/samples/platformer",
    component: () => import("../pages/samples/platformer/PlatformerPage.vue"),
  },
  {
    path: "/samples/isometric",
    component: () => import("../pages/samples/isometric/IsometricPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: "/", component: HomePage }, ...routes],
});
