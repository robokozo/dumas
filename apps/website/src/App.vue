<template>
  <nav>
    <RouterLink to="/">Dumas</RouterLink>
    <div class="links">
      <RouterLink to="/sandbox">Sandbox</RouterLink>
      <RouterLink to="/bouncing-ball">Bouncing Ball</RouterLink>
      <RouterLink to="/block-wall">Block Wall</RouterLink>
      <RouterLink to="/newtons-cradle">Newton's Cradle</RouterLink>
    </div>
  </nav>
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #111;
}

nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
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

nav a.router-link-active {
  color: #4af;
}

.links {
  display: flex;
  gap: 1.25rem;
}
</style>
