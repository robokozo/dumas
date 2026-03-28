<template>
  <div class="nav">
    <div class="nav__n"><slot name="north" /></div>
    <div class="nav__w"><slot name="west" /></div>
    <div class="nav__center"><slot name="center" /></div>
    <div class="nav__e"><slot name="east" /></div>
    <div class="nav__s"><slot name="south" /></div>
  </div>
</template>

<style scoped>
.nav {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: 2.2rem 5rem 2.2rem;
  grid-template-rows: 2.2rem 2.2rem 2.2rem;
  gap: 0.2rem;
  align-items: center;
  justify-items: center;
  pointer-events: auto;
}

.nav__n {
  grid-area: 1 / 2;
}
.nav__w {
  grid-area: 2 / 1;
}
.nav__center {
  grid-area: 2 / 2;
  color: rgba(210, 170, 70, 0.9);
  font-family: serif;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
}
.nav__e {
  grid-area: 2 / 3;
}
.nav__s {
  grid-area: 3 / 2;
}
</style>
