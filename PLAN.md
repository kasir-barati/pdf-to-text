# Tooling: oxfmt, oxlint, Pre-commit

## Goal

Add code formatting, linting, and a pre-commit hook, following the patterns
used in `smart-novel` (references: `.husky/pre-commit` and
`eslint.config.mjs`), adapted to this project's plain Vite + React + TS
stack (no Nx, no Prisma) and keeping this project's existing linter,
**oxlint** — the reference `eslint.config.mjs` is used only as a source of
_which rules_ to match, not as a reason to switch linters.

## Changes

### 1. oxlint — match the reference config's rule intent

Keep `oxlint` (already in use) as the linter. Extend `.oxlintrc.json`
(plugins: `react`, `typescript`, `oxc`, `unicorn`, `vitest`) with rules
carrying the same intent as the reference `eslint.config.mjs`:

- `no-console: error`
- `curly: ["error", "all"]`
- `no-unused-vars: warn` (ignoring `^_`-prefixed names/args, mirroring
  `unused-imports/no-unused-imports` + `unused-imports/no-unused-vars`)
- `vitest/no-disabled-tests: error`, `vitest/no-focused-tests: error`
  (scoped automatically to test files by the vitest plugin)

Not carried over: `@nx/eslint-plugin` (Nx-only), `perfectionist` import
sorting, and the Prisma/codegen file overrides — none apply here.
`eslint-plugin-prettier` isn't needed either — oxlint and the formatter run
as two separate steps instead of one linting through the other.

### 2. oxfmt (formatter)

`oxfmt` — the oxc project's formatter — instead of Prettier, keeping the
whole lint/format toolchain on oxc.

- `.oxfmtrc.json`, generated via `oxfmt --migrate=prettier` from an initial
  Prettier-style config matching the `smart-novel` style: single quotes,
  trailing commas, `printWidth: 70`, 2-space tabs, semicolons, LF line
  endings. (oxfmt doesn't yet support per-file-type `overrides`, so the
  YAML quote-style override from the reference isn't carried over — no
  YAML files in this project anyway.)
- `ignorePatterns: ["dist"]` in `.oxfmtrc.json` (replaces
  `.prettierignore`).

### 3. Pre-commit hook (husky + lint-staged)

- `husky` and `lint-staged` dev dependencies.
- `"prepare": "husky || true"` script so hooks install on `npm install`.
- `.lintstagedrc.json`:
  - `*.{ts,tsx,js,jsx}` → `oxlint --fix`, `oxfmt`
  - `*.{json,md,yml,yaml,css}` → `oxfmt`
- `.husky/pre-commit` → `npm run lint-staged` (no Nx/Prisma step, unlike
  the reference — not applicable here).

### 4. package.json scripts

- `"lint": "oxlint"` (unchanged)
- `"format": "oxfmt ."`
- `"lint-staged": "lint-staged"`
- `"prepare": "husky || true"`

## Verification

- `npm run lint` passes with no errors.
- `npx oxfmt --check .` passes.
- `npm run build` and `npm test` still pass.
- A test commit triggers the pre-commit hook and lint-staged runs.
