<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

## Boolean Checks and Naming

- No truthy/falsy checks. All checks must be explicit: `if (value !== null)`, `if (isActive === true)`, `if (items.length > 0)`.
- Boolean variable names must be prefixed with `is` or `has`.

## Interfaces vs Types

- Prefer `interface` for object shapes.
- Use `type` only for unions, primitives, or utility types where `interface` cannot be used.

## Compiler-Only TypeScript

- Prohibited: enums, namespaces, decorators, constructor parameter properties.
- TypeScript must be type-strippable (compatible with `--experimental-strip-types`).

## Null vs Undefined

- Prefer `null` over `undefined` for optional or missing values.

## Async Patterns

- Prefer `async`/`await`. Avoid `.then`/`.catch` chaining.

## Error Handling

- Only catch errors when gracefully resolvable. Let unhandled errors propagate.
- User-facing messages: friendly, non-technical. Developer-facing: include context and `code`/`type` property.

## File Naming

- Vue SFCs: PascalCase (`UserCard.vue`). General files: camelCase (`useFetch.ts`).
- Organize by feature folders.

## Preferred Libraries

- Validation: zod. Utilities: es-toolkit. Build: Vite ecosystem (rolldown, oxfmt, oxlint).
- Dates: date-fns. Testing: Vitest. State: Pinia. Styling: Tailwind CSS.

## VueUse

- Prefer VueUse utilities over manual equivalents (self-clean on unmount).
- Use `watchOnce` instead of a `watch` that manually stops itself after the first invocation.

## Imports

- Prefer absolute imports. Group: external → internal → styles.
- All imports explicit at top of file — no auto-imports. No default exports, always named exports.

## Comparisons

- Always use `===`. `==` only for null/undefined without distinguishing them.

## Destructuring and Module Pattern

- Prefer destructuring for params and variables.
- Prefer revealing module pattern over classes for stateful code.

## Function Style

- Use `function` keyword for declarations. Arrow functions only for inline callbacks.
- Functions take a single object parameter: `function createUser({ name, age }: { name: string; age: number }) {}`

## Function References in Callbacks

- Never pass bare function references. Use inline arrow functions: `array.map((x) => doStuff(x))`

## Vue API

- Composition API only.
- Type-only generics for `defineProps` and `defineModel`.
- SFC order: `<script>` → `<template>` → `<style>`.
- Avoid boolean props — prefer string union `state` prop.
- Prefer props/emits over `defineExpose` + template refs.

## Type Safety

- `any` strictly prohibited. `as` casting discouraged — prefer type guards.
- `as const` encouraged on object/array literals to preserve literal member types. Never use on primitive `const` declarations — `const FOO = 5` already infers `5`, not `number`.
- `satisfies` encouraged.

## Array Types

- Always use `Array<T>`, never `T[]`.

## Magic Numbers/Strings

- Define as named constants.

## Immutability

- Prefer immutability in shared/global state. Local mutation acceptable.

## Regular Expressions

- Always include comment with example matching strings above the regex.

## Comments

- Code self-documenting. Comments explain _why_, not _what_.

## Commits

- Conventional Commits: `<type>(<scope>): <subject>`.

## Dependency Injection

- Prefer DI via factory functions and object parameters over classes.

## Environment Variables

- Never hardcode secrets.
