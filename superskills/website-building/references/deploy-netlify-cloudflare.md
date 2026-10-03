> Distilled from: netlify-deploy (netlify/context-and-tools, MIT), netlify-frameworks (netlify/context-and-tools, MIT), nextjs-on-cloudflare (cloudflare/skills, Apache-2.0)

# Deploying on Netlify and Cloudflare

Vendor-specific. Same house rules as Vercel: preview or draft first, production only when asked, no git push or production publish without the user's yes, no purchases.

## Netlify

### 1. Ways to deploy

| Path | Notes |
|---|---|
| Git continuous deployment (default) | Every push builds; PRs get Deploy Previews at `deploy-preview-<n>--<site>.netlify.app` |
| `netlify deploy` | Draft deploy from the CLI. **Does not run your build command**: build first, then deploy the output folder |
| `netlify deploy --prod` | Straight to production. On a Git-CD site the next push to the production branch silently replaces it: warn the user, or lock the deploy |
| `netlify deploy --allow-anonymous` | Temporary project, must be claimed within 1 hour |
| Drag and drop (app.netlify.com/drop) | Not logged in: publishes files as they are |
| Build hooks | A URL that triggers a build; treated as trusted |

- Deploys are atomic: the live site switches only after every file has landed.
- Linking writes `.netlify/state.json`: add `.netlify` to `.gitignore`.
- Skip a deploy with `[skip ci]` or `[skip netlify]` (PR title for previews, commit message for branch/production).
- Branch deploys must be enabled per branch (wildcards like `features/*` allowed): `<branch>--<site>.netlify.app`.
- Preview URLs are public to anyone with the link unless protected. Only the production deploy and latest branch deploys are indexable; previews get `X-Robots-Tag: noindex`.
- Limit: 54,000 files per directory in the publish folder.

### 2. `netlify.toml` contexts

```toml
[build]
  command = "npm run build"
  publish = "dist"

[context.production]
  command = "npm run build:prod"
[context.deploy-preview]
  command = "npm run build:preview"
[context.branch-deploy]
  command = "npm run build:staging"
[context."features/search"]        # quote branch names with slashes
  command = "npm run build"
[[context.production.plugins]]     # plugins need double brackets
  package = "@netlify/plugin-sitemap"
```

Contexts: `production`, `deploy-preview`, `branch-deploy`, `preview-server`, `dev`, plus branch names. More specific beats general; the file beats UI settings. The file is committed: no secrets in it.

### 3. Environment variables (the most common bug)

- Values are injected **at build time**. Changing a variable does nothing until a new deploy builds.
- Variables in `netlify.toml` are not visible to functions at runtime. Set runtime variables in the UI, CLI or API with the Functions scope (SSR needs both Builds and Functions).
- **Never put a secret behind a client prefix**: `VITE_`, `NEXT_PUBLIC_`, `PUBLIC_`, `NUXT_PUBLIC_`, `REACT_APP_`, `GATSBY_`, `VUE_APP_` are inlined into the browser bundle.
- A secrets-scanning failure means something secret-looking reached build output. If real, stop shipping it and rotate it. Never set `SECRETS_SCAN_ENABLED=false` to silence a real leak; for genuinely public values scope `SECRETS_SCAN_OMIT_KEYS` / `SECRETS_SCAN_OMIT_PATHS`.

### 4. Frameworks

| Framework | Build | Publish | Adapter |
|---|---|---|---|
| Astro | `astro build` | `dist` | `npx astro add netlify` for SSR, middleware or Image CDN |
| Next.js 13.5+ | `next build` | `.next` | Zero-config OpenNext adapter (`@netlify/plugin-nextjs`); do not pin it |
| Nuxt 3 | `nuxt build` | `dist` | Nitro auto; `@netlify/nuxt` for local parity |
| SvelteKit | `vite build` | `build` | `@sveltejs/adapter-netlify` (replace adapter-auto); redirects go in `_redirects`, not the toml |
| Vite SPA | `vite build` | `dist` | `@netlify/vite-plugin` (dev only) |
| React Router 7 | `react-router build` | `build/client` | `@netlify/vite-plugin-react-router` |
| TanStack Start | `vite build` | `dist/client` | `@netlify/vite-plugin-tanstack-start` |
| Hugo / Eleventy | `hugo` / `eleventy` | `public` / `_site` | none |

- SPA routing needs `/* /index.html 200` (in `_redirects` or a `[[redirects]]` block). **Remove that catch-all when you adopt an SSR adapter**: it silently serves static `index.html` for SSR pages and API routes.
- Vite-based frameworks emulate Netlify functions, blobs, redirects, headers and env vars in their own dev server; `netlify dev` is only needed otherwise. With a custom `[dev] command` plus `targetPort`, set `framework = "#custom"` or the command is ignored.
- Check current package versions with `npm view <pkg> version` before pinning; never present a guessed version as current.

### 5. When a deploy fails

A failed deploy never publishes: the previous version is still live, so there is nothing to roll back. For a bad *published* deploy, fix forward: revert the commit and let CI redeploy. Read the deploy log from the first error. The dashboard's "Why did it fail?" diagnosis is free; "Fix with agent" spends the team's credits, so only the user starts it.

Private repos build only for recognised authors; an unknown author's merge sits in "Pending approval" until a team owner acts.

## Cloudflare (Workers)

### Next.js

- New Next.js projects on Workers: use **vinext** (Next.js API surface reimplemented on Vite, runs locally in workerd with Cloudflare bindings). Keep an existing OpenNext setup during unrelated work, and respect an explicit user choice.
- vinext maintains its own agent skills (`npx skills add cloudflare/vinext`, which installs third-party skills: ask first). Otherwise read the vinext README directly:
  - Empty folder: scaffold with `create-vinext-app` and the Cloudflare target.
  - Existing Next.js app: follow vinext's `migrate-to-vinext` guide, starting with its compatibility check. Do not assume full Next.js parity; verify each feature the app needs.

### Static sites and other frameworks

Use Cloudflare's current framework guide for the stack (Astro, Vite, SvelteKit and others have Workers adapters). Deploy with `npx wrangler deploy` after `wrangler login` (the user signs in). Preview with `npx wrangler dev`. Secrets go in `wrangler secret put NAME`, never in `wrangler.toml`.

## Pitfalls

- `netlify deploy` of a source folder, expecting it to build.
- Changing an env var and expecting the live site to update without a redeploy.
- An SPA catch-all left in place after switching to SSR.
- `NEXT_PUBLIC_STRIPE_SECRET`: any secret with a client prefix ships to the browser.
- Offering a "rollback" after a failed Netlify deploy.
