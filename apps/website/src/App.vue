<script setup lang="ts"></script>

<template>
  <div class="app">
    <nav>
      <RouterLink to="/">Dumas</RouterLink>
      <div class="links">
        <RouterLink to="/guides/world-setup">Guides</RouterLink>
      </div>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  background: #111;
}

#app {
  height: 100%;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

nav {
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: #000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: sans-serif;
}

nav a {
  color: #eee;
  text-decoration: none;
  font-size: 0.9rem;
}

nav > a {
  font-weight: 600;
  font-size: 1rem;
}

nav a:hover {
  color: #fff;
}

main {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.links {
  display: flex;
  gap: 1.25rem;
}

.dropdown {
  position: relative;
}

.dropdown-trigger {
  color: #eee;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0;
}

.dropdown-trigger:hover {
  color: #fff;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  padding-top: 0.5rem;
  min-width: 320px;
}

.dropdown-inner {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  color: #bbb;
  font-size: 0.8rem;
  transition:
    background 0.15s,
    color 0.15s;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.dropdown-item.router-link-active {
  background: rgba(68, 170, 255, 0.1);
  color: #4af;
}

.item-title {
  font-weight: 500;
}

.item-feature {
  font-size: 0.7rem;
  opacity: 0.5;
}
</style>
