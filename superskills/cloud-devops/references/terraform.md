# Terraform and OpenTofu

> Distilled from: terraform-skill (antonbabenko/terraform-skill, Apache-2.0), terraform-style-guide and terraform-test (hashicorp/agent-skills, MPL-2.0), cloud-run-basics (google/skills, Apache-2.0)

## Response contract (use for every Terraform answer)

1. **Assumptions**: runtime (`terraform` or `tofu`) and version, providers, backend, where it runs (local, CI, HCP/Atlantis), how critical the environment is.
2. **Risk addressed**: identity churn, secret exposure, blast radius, CI drift, state corruption, provider upgrade, testing gaps.
3. **Change and trade-offs.**
4. **Validation commands** you ran or the user should run.
5. **Rollback notes** for anything that mutates state or destroys.

Never recommend applying to production without a reviewed plan file and approval.

## Files and layout

```
terraform.tf   # required_version + required_providers (some teams call it versions.tf)
providers.tf   # provider blocks, default_tags, aliases
main.tf        # resources and data sources
variables.tf   # inputs, alphabetical
outputs.tf     # outputs, alphabetical
locals.tf      # locals
```

Repo layout: `environments/{dev,staging,prod}/` (root configs) separate from `modules/{networking,compute,data}/` (reusable), plus `examples/{minimal,complete}/` that double as test fixtures.

Module hierarchy: resource module (VPC + subnets) → infrastructure module (several resource modules) → composition (whole env, many regions/accounts).

## Style

- 2 spaces, aligned `=` in a block; run `terraform fmt -recursive`.
- Order inside a resource: `count`/`for_each` → arguments → nested blocks → `tags` → `depends_on` → `lifecycle`.
- Variable block order: `description`, `type`, `default`, `validation`, `nullable`, `sensitive`.
- Names: lowercase_underscores, singular, descriptive, no resource type in the name (`aws_instance.web_api`, not `webAPI-aws-instance`). Use `main` only for a lone resource with no better noun.
- Every variable has `description` and an explicit `type`; prefer `object({...})` with `optional()` defaults over `map(any)`. Prefix with context (`vpc_cidr_block`, not `cidr`).
- Every output has `description`; mark secrets `sensitive = true`; expose stable attributes, not whole provider objects.
- Common tags via `locals` + `merge()`, or provider `default_tags`.

## count vs for_each

| Case | Use |
|---|---|
| Create or not | `count = var.enabled ? 1 : 0` |
| Several named things that may be added/removed | `for_each = toset(var.names)` or a map |
| Need lookup by key | `for_each = map` |

Never use a list index as long-lived identity: removing a middle item renames every later address and destroys/recreates them. Migrating `count` → `for_each`: add `moved { from = aws_x.y[0] to = aws_x.y["a"] }` blocks and confirm the plan shows 0 to destroy.

## Version pinning

| Thing | Pin |
|---|---|
| Terraform runtime | `required_version = "~> 1.9"` (minor) |
| Providers | `version = "~> 6.0"` (major) |
| Modules in prod | exact `version = "5.1.2"` |
| Modules in dev | `~> 5.1` |

Commit `.terraform.lock.hcl`. Do provider/runtime upgrades in their own PR.

## Feature floors (check before using)

`moved` 1.1 · `optional()` 1.3 · `import` blocks and `check` 1.5 · `terraform test` 1.6 (OpenTofu starts at 1.6) · mock providers and `removed` 1.7 · provider functions 1.8 · cross-variable validation and `parallel` runs 1.9 · S3 `use_lockfile` 1.10 · `write_only` arguments 1.11 · `action` blocks, list resources and `terraform query` 1.14 · `const` variables (dynamic module sources), `deprecated` on variables and outputs, `convert()` 1.15 · `before_destroy`/`after_destroy` action events and `import` blocks inside child modules 1.16.

Many of these are Terraform-only; check the OpenTofu release notes before using one under `tofu`. Raise `required_version` in the same PR that uses a new feature.

## Newer features (1.14 to 1.16)

- **Actions** (1.14): a top-level `action` block runs a provider operation that is not create/read/update/delete (invoke a function, flush a cache, run a backup). Attach it to a resource with `lifecycle { action_trigger { events = [before_destroy] actions = [action.example_cleanup.archive] } }`. In 1.16 the destroy events exist: use them for a final backup or releasing an address before deletion. The action's configuration and trigger must be known at plan time, cannot use ephemeral values, and the trigger must still be in the configuration when you plan the destroy. Actions are side effects, so show them in the plan summary and keep them out of any "plan only" PR job that has write credentials.
- **Imports in child modules** (1.16): a module can carry `import { to = aws_s3_bucket.this  id = var.existing_bucket_name }`, so adoption lives with the resource instead of in every root. Still review the plan for bindings to the wrong address.
- **Query** (1.14): `terraform query` with `*.tfquery.hcl` lists existing infrastructure and can generate config for import. Use it to find unmanaged resources before writing `import` blocks.
- **Dynamic module sources** (1.15): a variable marked `const = true` may appear in a module `source` or `version`. It cannot also be `sensitive` or `ephemeral`.
- **Deprecation** (1.15): `deprecated = "use X instead"` on a variable or output warns callers at validate time; use it for a release or two before removing an input.
- **`convert()`** (1.15): fixes inference for empty containers, e.g. `convert(map(string), {})` for an empty map instead of an empty object.

## State

- Never local state for teams or prod. Remote backend with locking and encryption:
  - S3: `bucket`, `key = "prod/vpc/terraform.tfstate"`, `encrypt = true`, `use_lockfile = true` (1.10+; older: `dynamodb_table`).
  - Azure: `azurerm` backend (blob lease locking). GCP: `gcs` backend (built-in locking). Or HCP Terraform.
- Split state by environment and component (`prod/networking`, `prod/compute`). Split when teams, cadence differ or > ~500 resources; keep together when tightly coupled and < ~100.
- Change addresses with `moved` blocks or `terraform state mv`; adopt existing resources with `import` blocks; drop from management with `removed` blocks. Never hand-edit `terraform.tfstate`.
- Stuck lock: find out who holds it (CI job still running?) before `force-unlock`. Never delete lock files blindly.
- Never commit `*.tfstate`, `.terraform/`, `*.tfplan`, or secret `.tfvars`.

## Secrets

- No secrets in variable defaults or `.tfvars`. Read them at runtime from a secret manager, or use `write_only`/`*_wo` arguments (1.11+) so they never land in state.
- `sensitive = true` hides CLI output only; the value is still in state. Restrict and encrypt the state bucket.
- Avoid provisioners (`local-exec`, `remote-exec`, `null_resource`) for bootstrapping; use cloud-init, images, or config management. Provisioner output can leak secrets into CI logs.

## Security defaults

Dedicated VPCs (not default), encryption at rest and TLS, no `0.0.0.0/0` ingress except public load balancers on 80/443, separate `aws_vpc_security_group_ingress_rule`/`egress_rule` resources instead of inline blocks (AWS provider 5+). Scan with `trivy config .` and `checkov -d .`; lint with `tflint`.

## Testing

| Situation | Approach |
|---|---|
| Every commit | `fmt -check`, `validate`, `tflint`, `trivy`/`checkov` |
| Module logic, 1.6+ | `terraform test` with `command = plan` |
| Computed values (ARNs, IDs) or set-type blocks | `command = apply` (creates real resources) |
| No credentials / cheap PR checks, 1.7+ | `mock_provider` |
| Pre-1.6 or complex multi-cloud | Terratest (Go) |

Test file rules:
- Put tests in `tests/`; name `*_unit_test.tftest.hcl` (plan) and `*_integration_test.tftest.hcl` (apply) so CI can filter.
- One behaviour per `run` block; clear `error_message`.
- Use `expect_failures = [var.x]` to test validation rules.
- Set-type nested blocks can't be indexed with `[0]`; use a `for` expression or apply mode.
- `module { source = "./modules/vpc" }` supports local and registry sources only.

```hcl
run "nat_gateway_disabled" {
  command = plan
  variables { create_nat_gateway = false }
  assert {
    condition     = length(aws_nat_gateway.main) == 0
    error_message = "NAT gateway must not be created when disabled"
  }
}
```

Run: `terraform test`, `terraform test -filter=tests/defaults_unit_test.tftest.hcl`, `-verbose` for detail.

## Safe apply and destroy

1. `terraform plan -out=tfplan`, read every create/change/**destroy** and every `-/+` replacement.
2. Apply exactly that file: `terraform apply tfplan`.
3. Destroy: always `terraform plan -destroy [-target=...]` first and show the user the full list. Watch for implicit dependents: a `for_each` resource fed by a local that references a targeted resource is destroyed in full.
4. Get explicit confirmation of the list. Never `-auto-approve` a destroy.
5. For critical resources add `lifecycle { prevent_destroy = true }`.

## CI pipeline shape

validate (`fmt -check`, `init`, `validate`, `tflint`) → test → security scan → `plan -out` (upload artifact, post summary to PR) → apply the downloaded plan on `main` in a protected `production` environment with required reviewers.

- Authenticate with OIDC (see [ci-cd.md](ci-cd.md)), not static keys.
- Use `-lock-timeout=5m` for concurrent runs; cache providers via `TF_PLUGIN_CACHE_DIR`.
- Drift detection: scheduled `plan -detailed-exitcode` (exit 2 = drift) that alerts. Never a cron `apply -auto-approve`.
- Plan JSON can contain secrets; restrict artifact access.

## LLM mistakes to catch before answering

- Local state or one monolithic state for "simplicity"
- `count` over a list of names; renames without `moved`
- Features above the user's version floor
- Re-running `plan` inside the apply job
- Wildcard OIDC `sub` claims
- Secrets in defaults/tfvars, or believing `sensitive` keeps them out of state
- Provider upgrade mixed into a feature PR
- Using a `null_resource` provisioner for a one-off backup or cleanup when the runtime has `action` blocks (1.14+; destroy events 1.16+)
