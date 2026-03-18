<template>
  <div class="home">
    <h1>Dumas Demos</h1>
    <ul>
      <li>
        <RouterLink to="/bouncing-ball">Bouncing Ball</RouterLink>
      </li>
      <li>
        <RouterLink to="/block-wall">Block Wall</RouterLink>
      </li>
      <li>
        <RouterLink to="/newtons-cradle">Newton's Cradle</RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.home {
  padding: 5rem 2rem 2rem;
  font-family: sans-serif;
  color: #eee;
  background: #111;
  min-height: 100vh;
}

h1 {
  margin-bottom: 1.5rem;
}

ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

a {
  color: #4af;
  font-size: 1.1rem;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
