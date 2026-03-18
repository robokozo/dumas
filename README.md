# Dumas

A physics playground built on top of the [TresJS](https://tresjs.org) ecosystem — named after Alexandre Dumas, author of _The Three Musketeers_. The name is a nod to the three TresJS libraries the project is built with: [Tres](https://tresjs.org), [Cientos](https://cientos.tresjs.org), and [TresLeches](https://leches.tresjs.org).

## Packages

- **`@dumas/core`** — ECS-based physics engine built on [Rapier](https://rapier.rs) and [bitECS](https://github.com/NateTheGreatt/bitECS), exposed as Vue composables and components.

## Apps

- **`website`** — Demo app showcasing the core package with interactive physics scenes.

## Development

- Check everything is ready:

```bash
vp run ready
```

- Run the tests:

```bash
vp run test -r
```

- Build the monorepo:

```bash
vp run build -r
```

- Run the development server:

```bash
vp run dev
```
