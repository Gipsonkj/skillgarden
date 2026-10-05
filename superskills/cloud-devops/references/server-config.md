# Configuring servers (Ansible)

> Written from the official Ansible and ansible-lint documentation, in our own words.

Terraform (or the cloud console) creates machines; something has to put packages, files, users and services on them. That is this guide. Containers and Kubernetes carry their config in the image and manifests instead (see [docker.md](docker.md), [kubernetes.md](kubernetes.md)).

## Pick a tool

| Situation | Use | Why |
|---|---|---|
| The team already uses a config tool (Ansible, Chef, Puppet, Salt) or a golden-image pipeline | That one | Two tools managing the same files fight each other |
| The app can run as a container | No server config: a container platform ([platform-choice.md](platform-choice.md)) | Nothing to patch by hand; the image is the config |
| VMs or bare metal to configure over SSH, no agent wanted | Ansible (below) | Agentless, YAML playbooks, runs from a laptop or CI |
| A first-boot setup for a cloud VM that rarely changes | The VM's user data (cloud-init), set from Terraform | No extra tool to run or learn |
| Unsure whether the hosts are pets (patched in place) or cattle (replaced) | Ask the user | Decides between configuring in place and rebuilding images |

## Ansible basics

- **Install on the control machine** (macOS, Linux, BSD; Windows only through WSL): `pipx install --include-deps ansible`. `ansible` is the full package with community collections; `ansible-core` is the minimal one. Managed hosts need only SSH and Python.
- **Collections** the project uses go in `requirements.yml`, pinned, and are installed with `ansible-galaxy collection install -r requirements.yml`:

  ```yaml
  collections:
    - name: amazon.aws
      version: "==<x.y.z>"   # the version you tested
  ```
- **Layout** that stays readable:

  ```
  ansible/
    inventory/staging.yaml   inventory/production.yaml   # or *aws_ec2.yml (dynamic)
    group_vars/  host_vars/
    roles/<role>/{tasks,handlers,templates,defaults}/
    site.yml   requirements.yml   .ansible-lint
  ```

## Inventory

Static YAML; group names meaningful, case-sensitive, no hyphens or leading digits (`web_eu`, not `web-eu`):

```yaml
web:
  hosts:
    web_01: { ansible_host: 192.0.2.50 }
    web_02: { ansible_host: 192.0.2.51 }
```

Check it before running anything: `ansible-inventory -i inventory/staging.yaml --list` and `ansible web -m ping -i inventory/staging.yaml`.

**Hosts Terraform made:** don't copy IPs by hand. Use the cloud's inventory plugin so hosts come from tags. AWS: a file whose name ends in `aws_ec2.yml` or `aws_ec2.yaml`, needing `boto3` and `botocore` 1.35.0 or newer on the control machine and the usual AWS credentials (profile, env or instance role, never keys in the file):

```yaml
# inventory/prod.aws_ec2.yml
plugin: amazon.aws.aws_ec2
regions: [eu-central-1]
filters:
  tag:Environment: prod
keyed_groups:
  - key: ec2_tags          # groups like tag_Role_web
    prefix: tag
compose:
  ansible_host: private_ip_address
```

Without `regions` the plugin queries every region. Use `ec2_tags` in templates, not the deprecated `tags` host variable.

## A playbook that is safe to re-run

```yaml
# site.yml
- name: Web servers
  hosts: web
  become: true                  # sudo by default
  serial: [1, "30%"]            # one host first, then 30% at a time
  any_errors_fatal: true        # a failure stops the play after the current batch
  tasks:
    - name: Install nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true
        cache_valid_time: 3600
    - name: Main nginx config
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        mode: "0644"
        validate: nginx -t -c %s   # refuses a broken file before it lands
        backup: true
      notify: Reload nginx
  handlers:
    - name: Reload nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded
```

Rules:
- **Modules, not shell.** A module describes the end state, so a second run changes nothing. `ansible.builtin.command` does not go through a shell (no pipes, `>`, `;`); use it with `creates:` / `removes:` so it knows when to skip, and `ansible.builtin.shell` only when you truly need shell features.
- **Handlers** run once at the end of the play, and only if a task that notifies them changed something. Need the reload earlier: `- meta: flush_handlers`. Handler names must be unique (a duplicate shadows the earlier one). `state: reloaded` always reloads and starts the service if it was stopped; `restarted` always restarts.
- **Rolling changes:** `serial` takes a number, a percentage or a list; combine with `any_errors_fatal` (finish the failing task on the current batch, then stop) or `max_fail_percentage` (stop once failures exceed, not equal, the percentage) so a bad change goes no further. Use `throttle` on one task that hits a rate-limited API, `run_once` for a step like a migration that should run on one host per batch.
- **Parallelism:** 5 forks by default; raise with `-f 20` or `forks` in `ansible.cfg`.
- **Escalation:** `become: true` with `become_user` for a non-root target; `-K` prompts for the sudo password at run time.

## Run order (every change)

1. `ansible-lint --profile production` from the project root (profiles: `min`, `basic`, `moderate`, `safety`, `shared`, `production`; `--fix` applies safe auto-fixes; config in `.ansible-lint`).
2. `ansible-playbook -i inventory/staging.yaml site.yml --syntax-check`, then `--list-hosts` and `--list-tasks`.
3. Dry run on one host: `ansible-playbook -i inventory/staging.yaml site.yml --check --diff --limit web_01`. Modules without check-mode support report nothing; `command` is skipped in check mode unless it has `creates`/`removes`, so a clean dry run is not proof.
4. Real run on staging, then production. Before production, show the inventory file, the `--list-hosts` output and the diff, and wait for a yes. Never point at production by default.

Handy flags: `-l/--limit` (subset of hosts), `-t/--tags` (only tagged tasks), `-e` (extra vars), `--start-at-task` (resume), `--step` (confirm each task).

## Secrets

- **Ansible Vault** encrypts values that live in the repo: `ansible-vault encrypt_string --vault-id prod@prompt 'the-value' --name 'db_password'` and paste the output into `group_vars`. Don't press Enter after typing the value; it adds a newline to the secret. Whole files: `ansible-vault create`, `edit`, `view`.
- **Vault password** at run time comes from `--vault-id label@prompt` or `--vault-password-file` pointing at a file outside the repo. Never commit it, never paste it into chat.
- **Keep secrets out of output:** `no_log: true` on tasks that handle them (it does not cover debug output, so don't run `-vvv` against prod), and `diff: false` on templates that contain them so `--diff` doesn't print them.
- Prefer pulling secrets from the cloud's secret manager at run time over storing them in vault when the hosts already have an identity.

## Done means

- [ ] Inventory and environment named and confirmed; production run only after a yes
- [ ] `ansible-lint` clean at the agreed profile; `--syntax-check` passes
- [ ] `--check --diff` on one host reviewed; second real run reports no changes (idempotent)
- [ ] Collections pinned in `requirements.yml`; no plaintext secrets, vault password outside the repo
- [ ] Rolling `serial` with a failure limit for anything that restarts services
