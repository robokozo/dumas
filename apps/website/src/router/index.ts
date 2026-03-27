import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomePage from "../pages/home/HomePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/guides/world-setup",
    component: () => import("../pages/guides/worldSetup/WorldSetupPage.vue"),
  },
  {
    path: "/guides/physics",
    component: () => import("../pages/guides/physics/PhysicsPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: "/", component: HomePage }, ...routes],
});
