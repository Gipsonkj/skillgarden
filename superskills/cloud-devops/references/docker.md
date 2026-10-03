# Docker images and Compose

> Distilled from: docker-build-strategies (docker/skills, Apache-2.0), docker-patterns (affaan-m/ECC, MIT), cloud-run-basics (google/skills, Apache-2.0), kubernetes-specialist (Jeffallan/claude-skills, MIT)

Templates: `templates/docker-build-strategies/Dockerfile.{go,nodejs,python}` and `dockerignore-example`. Verify a build with `scripts/docker-build-strategies/verify-build.sh` (see bottom).

## Dockerfile rules

1. First line `# syntax=docker/dockerfile:1` (enables BuildKit features). Needs Docker 23+ or `DOCKER_BUILDKIT=1`.
2. **Multi-stage** whenever there's a build step: name stages (`AS deps`, `AS build`, `AS runtime`), copy only the artifact into the runtime stage with `COPY --from=build`.
3. **Runtime base**: `scratch` (static Go), `distroless`, `-alpine` or `-slim`. Pin a version tag or digest, never `latest`.
4. **Order for cache**: least-changing first. Dependency manifests and install before `COPY . .`.
   - Bind-mount manifests for read-only installs so they never enter a layer:
     `RUN --mount=type=bind,source=package.json,target=package.json --mount=type=bind,source=package-lock.json,target=package-lock.json npm ci`
   - Cache mounts for package managers: npm `/root/.npm`, pip `/root/.cache/pip`, Go `/go/pkg/mod`, apt `/var/cache/apt` + `/var/lib/apt` with `sharing=locked` (then no `rm -rf /var/lib/apt/lists/*` needed).
5. `WORKDIR` before any `COPY`/`RUN`. Never rely on `/`.
6. **Non-root**: create a user with numeric IDs (`--uid 1001 --gid 1001`), `COPY --chown=1001:1001` (numeric is required with `COPY --link`), `USER` after file operations and before `ENTRYPOINT`. Distroless: `USER nonroot:nonroot`.
7. Exec-form `ENTRYPOINT ["node","dist/index.js"]`, `EXPOSE` the port, OCI label `org.opencontainers.image.source`.
8. Serve on `0.0.0.0` and read the port from `$PORT` (Cloud Run injects it, default 8080). Binding `127.0.0.1` = crash or 502.
9. Add a `HEALTHCHECK` (or platform probe) hitting a cheap `/health` that returns 200.
10. Combine related `RUN` lines with `&&`; keep logically separate steps separate for cache granularity.
11. Build for `linux/amd64` when targeting Cloud Run or most managed runtimes (`docker buildx build --platform linux/amd64`), especially from Apple Silicon.

## Secrets at build time

- Never pass credentials through `ARG` or `ENV`; both show in `docker history`.
- Never `COPY` `.npmrc`, `.pypirc`, `.netrc`, `.env`, cloud credential files, kubeconfig, SSH keys or `*.pem` into the context, even in a throwaway stage (they stay in cache and intermediate layers).
- Use `RUN --mount=type=secret,id=npmrc,target=/root/.npmrc,required=true npm ci` and build with `docker buildx build --secret id=npmrc,src=$HOME/.npmrc .`. Use `required=false` only if the build can succeed without it.
- Private git: `RUN --mount=type=ssh` plus `ssh-keyscan github.com >> ~/.ssh/known_hosts` in the same step; build with `--ssh default`. Never `StrictHostKeyChecking=no`. Expose only the one key the build needs (`ssh-add -l` to check).
- `.dockerignore` of `.env`/keys is defence in depth, not the main control.

## .dockerignore (always ship one)

Exclude `.git/`, CI folders, editor folders, `node_modules/`, `__pycache__/`, `.venv/`, build outputs, coverage, `*.md`/docs, `.env*`, `*.pem`, `*.key`, and the Dockerfiles themselves. Start from `templates/docker-build-strategies/dockerignore-example`.

## Size checklist (when "the image is too big")

1. Is there a multi-stage build? Is the final stage a slim/distroless base?
2. Are dev dependencies excluded (`npm ci --omit=dev`, separate deps stage)?
3. Is the build context small (check `.dockerignore`; watch "transferring context" size)?
4. Are package caches kept out of layers (cache mounts)?
5. No docs, man pages, compilers or debug tools in runtime.
Typical results: Node app 1 GB → 150-250 MB on alpine; Go static binary → 10-20 MB on scratch/distroless.

## Compose for local development

- One process per container; services find each other by service name (`postgres://db:5432/...`).
- `depends_on: { db: { condition: service_healthy } }` plus a real `healthcheck` (e.g. `pg_isready -U postgres`, interval 5s, retries 5).
- Named volumes for data (`pgdata:/var/lib/postgresql/data`); bind mount source for hot reload, with an anonymous volume to protect container `node_modules` (`- /app/node_modules`).
- Use a `dev` target of the same multi-stage Dockerfile; `docker-compose.override.yml` for dev-only settings (auto-loaded), `-f docker-compose.yml -f docker-compose.prod.yml` for explicit others.
- Bind DB ports to localhost only: `"127.0.0.1:5432:5432"`; omit ports entirely if only other containers need it.
- Separate networks to keep the DB unreachable from the frontend container.
- Secrets via a git-ignored `.env` (`env_file:`) or Compose secrets; never inline in the YAML.
- Hardening flags worth adding: `read_only: true`, `tmpfs: [/tmp]`, `security_opt: [no-new-privileges:true]`, `cap_drop: [ALL]` (add back `NET_BIND_SERVICE` only for ports < 1024).
- Compose is for dev and single-host setups. For production multi-container workloads use a managed container platform or Kubernetes.

## Debugging containers

```bash
docker compose logs -f app            # follow logs
docker compose exec app sh            # shell in
docker inspect <c> --format '{{.Config.User}}'
docker exec <c> nslookup db           # DNS inside the network
docker network inspect <project>_default
docker history --no-trunc <image>     # check for leaked secrets / fat layers
```

Destructive cleanup (`docker system prune`, `docker volume rm`, `docker rm -f`) deletes data. Ask first, and say which volumes would go.

## Verify a build

Run from the project root (the folder with the Dockerfile):

```bash
bash "<this-skill-dir>/scripts/docker-build-strategies/verify-build.sh" [IMAGE_NAME]
```

It builds the image and prints its size and configured user. Pass: build succeeds, user is not empty/root, size is reasonable for the stack. Without the script: `docker build -t t .`, `docker images t`, `docker inspect t --format '{{.Config.User}}'`.
