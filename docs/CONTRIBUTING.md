# Contributing Notes

## Local development

```bash
pnpm install
pnpm run dev
```

## Before committing

```bash
pnpm run build
```

## Repo hygiene

Do not commit:

- `node_modules/`
- `dist/`
- `.env`
- local screenshots
- generated ZIP files

## Package manager

Use `pnpm`. Do not add `package-lock.json` or `yarn.lock`.
