# Observability and incident triage

> Distilled from: opentelemetry (grafana/skills, Apache-2.0), grafana-dashboards (wshobson/agents, MIT), workers-best-practices (cloudflare/skills, Apache-2.0), aws-lambda (awslabs/agent-plugins, Apache-2.0), azure-diagnostics (microsoft/azure-skills, MIT), kubernetes-specialist (Jeffallan/claude-skills, MIT), plus the official Datadog docs (written in our own words)

## Minimum for anything in production

1. **Structured JSON logs** with timestamp, level, message, request/trace ID, and no secrets or personal data.
2. **Resource attributes on every signal**: `service.name`, `service.namespace`, `service.version`, `deployment.environment`.
3. **RED metrics** per service: Rate (req/s), Errors (error rate %), Duration (p50/p95/p99 latency).
4. **USE metrics** per resource: Utilization, Saturation (queue length, throttles), Errors.
5. **Traces** across service hops (W3C `traceparent` propagation).
6. **Alerts** on symptoms users feel: error rate and p95/p99 latency against an SLO, plus saturation (disk, memory, queue age). Each alert links a runbook.

Platform switches: Cloudflare Workers need `observability.enabled` **and** `observability.traces.enabled`; Lambda uses Powertools (logs, EMF metrics, X-Ray); Azure uses Application Insights connected to Log Analytics; Cloud Run logs go to Cloud Logging automatically.

## Pick a backend

| Situation | Use | Why |
|---|---|---|
| The team already has one (Datadog, Grafana, a cloud console) or pays for it | That one | Alerts, dashboards and on-call already live there |
| Small app on one platform, no budget for a tool | The platform's own logs and metrics (switches above) | Free or included; enough until there are several services |
| Open source, self-hosted, or Grafana Cloud; want to avoid vendor lock-in | OpenTelemetry → Grafana (below) | Standard SDKs, swap the backend by changing an endpoint |
| Company standard is Datadog, or wants one paid SaaS for infra, APM, logs and monitors | [Datadog](#datadog) | One agent per host or cluster, tags tie traces, logs and metrics together |
| Not sure which they log into | Ask the user | Instrumenting for the wrong backend wastes the work and the bill |

Datadog and Grafana both accept OTLP, so instrumenting with OpenTelemetry keeps the backend choice reversible.

## OpenTelemetry setup

Apps emit OTLP → (optional collector: Alloy or OTel Collector) → backend (Grafana Cloud Mimir/Loki/Tempo/Pyroscope, or any OTLP vendor).

Env vars (work across SDKs):

| Variable | Example |
|---|---|
| `OTEL_SERVICE_NAME` | `checkout` |
| `OTEL_RESOURCE_ATTRIBUTES` | `service.namespace=shop,deployment.environment=prod,service.version=1.4.2` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4317` (local collector) or vendor gateway |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `grpc` (local collector) or `http/protobuf` (most cloud gateways) |
| `OTEL_EXPORTER_OTLP_HEADERS` | `Authorization=Basic <base64(instanceID:token)>` for Grafana Cloud |
| `OTEL_TRACES_SAMPLER` / `_ARG` | `parentbased_traceidratio` / `0.1` |

Zero-code / auto-instrumentation:
- Python: `pip install "opentelemetry-distro[otlp]" && opentelemetry-bootstrap -a install`, run with `opentelemetry-instrument python app.py`. Under Gunicorn/uWSGI, initialise providers in a post-fork hook.
- Java: run with `-javaagent:` (OTel Java agent or Grafana's distribution).
- Node: `@opentelemetry/auto-instrumentations-node` loaded before the app (`--require`/`--import`). Bundlers like ncc break require hooks.
- .NET: OpenTelemetry .NET SDK (or Grafana.OpenTelemetry).
- Kubernetes: OTel Operator `Instrumentation` resource plus pod annotation `instrumentation.opentelemetry.io/inject-java: "true"` (or `-python`, `-nodejs`, `-dotnet`).
- No code changes possible: eBPF (Grafana Beyla).

Keep tokens in a secret store, not in the env file committed to git.

### Sampling

- Head sampling (`parentbased_traceidratio`, e.g. 10%): cheap, but can drop rare errors.
- Tail sampling (in the collector): keep 100% of errors and slow traces, sample the rest. Use when volume is high and errors are rare.

### "No data" checklist

- 401 → bad credentials or token lacks write scopes; instance ID must be numeric (Grafana Cloud).
- 404 → wrong endpoint path (Grafana Cloud gateway ends in `/otlp`).
- Nothing arrives → protocol mismatch (grpc vs http/protobuf, ports 4317 vs 4318), or app exits before batch export (flush on shutdown).
- Smoke-test an OTLP endpoint with an empty POST: 400 = endpoint and auth fine; 401/404 = fix those.
- Then look for the service: TraceQL `{ resource.service.name = "checkout" }`, expect spans within ~30 s.

## Dashboards (Grafana or similar)

Layout top to bottom: headline numbers (stat panels: req/s, error %, p95, availability) → trends (time series) → detail (tables, heatmaps for latency distributions).

Rules:
- One dashboard per service (RED) and per platform layer (USE); a top-level overview linking to them.
- Template variables for `environment`, `service`, `instance` instead of copies per env.
- Correct units on every panel (seconds, bytes, %), thresholds with meaning (green/amber/red tied to SLO), panel descriptions.
- Default range ~6 h; check it still reads at 7 d.
- Consistent colour per series across dashboards; avoid red/green-only encoding.
- Dashboards as code: provision JSON from git, or Terraform `grafana_dashboard`. Start from a community dashboard and trim.

Example PromQL:
```promql
sum(rate(http_requests_total{service="$service"}[5m]))                                          # rate
sum(rate(http_requests_total{service="$service",status=~"5.."}[5m])) / sum(rate(http_requests_total{service="$service"}[5m]))  # error ratio
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket{service="$service"}[5m])))  # p95
```

Alert example: error ratio > 2% for 5 m (page), p95 > 1 s for 10 m (ticket). Use `for:` durations to avoid flapping.

## Datadog

SaaS observability: an Agent on each host or cluster collects metrics, traces and logs and ships them to the org's Datadog site.

**Site and keys first.** Each org lives on one site and sites share no data: `datadoghq.com` (US1), `us3.datadoghq.com`, `us5.datadoghq.com`, `datadoghq.eu`, `ap1.datadoghq.com`, `ap2.datadoghq.com`, `uk1.datadoghq.com`, `ddog-gov.com`, `us2.ddog-gov.com`. Ask which one the user logs into before configuring anything. The **API key** sends data; an **application key** is also needed to read or manage things through the API. Keep both in a secret store or Kubernetes Secret, never in values files or the repo. API clients default to the US site; for others set the API host (e.g. `https://api.datadoghq.eu`). Check a key with `GET /api/v1/validate` and the `DD-API-KEY` header.

**Kubernetes (Datadog Operator):**

```bash
helm repo add datadog https://helm.datadoghq.com
helm install datadog-operator datadog/datadog-operator
kubectl create secret generic datadog-secret --from-literal api-key="$DD_API_KEY"
```

```yaml
apiVersion: datadoghq.com/v2alpha1
kind: DatadogAgent
metadata: { name: datadog }
spec:
  global:
    clusterName: prod-eu
    site: datadoghq.eu
    credentials:
      apiSecret: { secretName: datadog-secret, keyName: api-key }
```

`kubectl apply -f datadog-agent.yaml`. The Helm-only route is the `datadog/datadog` chart with `datadog.site`, `datadog.clusterName` and `datadog.apiKeyExistingSecret: datadog-secret`.

**Unified service tagging.** Set `env`, `service` and `version` everywhere so traces, metrics and logs join up: env vars `DD_ENV`, `DD_SERVICE`, `DD_VERSION` on the container, and labels `tags.datadoghq.com/env`, `tags.datadoghq.com/service`, `tags.datadoghq.com/version` on the workload and pod template. Set `version` to the image tag so each deploy can be told apart.

**Traces.** Two routes:
- Datadog's library, e.g. Node: `npm install dd-trace`, start with `node --require dd-trace/init app.js` (or `NODE_OPTIONS=--require dd-trace/init`) so it loads before every other module. It sends to the Agent at `DD_AGENT_HOST` (default localhost) port `DD_TRACE_AGENT_PORT` (default 8126); `DD_LOGS_INJECTION` adds trace IDs to logs.
- Keep OpenTelemetry (above) and turn on OTLP ingest in the Agent, which is off by default: `DD_OTLP_CONFIG_RECEIVER_PROTOCOLS_GRPC_ENDPOINT=0.0.0.0:4317` and/or `DD_OTLP_CONFIG_RECEIVER_PROTOCOLS_HTTP_ENDPOINT=0.0.0.0:4318`, then point `OTEL_EXPORTER_OTLP_ENDPOINT` at the Agent. Metrics and traces flow once enabled; OTLP logs stay off (to avoid surprise billing) until both `logs_enabled: true` and `otlp_config.logs.enabled: true` are set. Pick this route when the backend may change later.

**Monitors as code.** Use the Terraform provider (keys from `DD_API_KEY` / `DD_APP_KEY`, `api_url` for non-US sites, e.g. `https://api.datadoghq.eu/`) so alerts are reviewed like code:

```hcl
resource "datadog_monitor" "checkout_errors" {
  name    = "checkout error rate high (prod)"
  type    = "query alert"
  query   = "<metric query> > 0.02"     # build it in the UI, copy the API form
  message = "{{#is_alert}}Error rate above 2%. Runbook: <url> @<team-or-pagerduty-handle>{{/is_alert}}"
  monitor_thresholds { critical = 0.02 }
  draft_status = "draft"                  # evaluates without notifying until published
  tags = ["service:checkout", "env:prod"]
}
```

- `type` cannot change after creation (e.g. `metric alert`, `query alert`, `log alert`, `service check`, `slo alert`); `terraform plan` validates the query.
- `@` handles in `message` route notifications (`@user@example.com`, `@slack-<channel>`, `@pagerduty-<service>`), with a space before each; `{{#is_alert}}`, `{{#is_recovery}}` and `{{#is_renotify}}` vary the text.
- Without Terraform: `POST /api/v1/monitor/validate`, then `POST /api/v1/monitor` with `name`, `type`, `query`, `message` and headers `DD-API-KEY` and `DD-APPLICATION-KEY`.
- A monitor that notifies people is sending on their behalf: show the query, threshold and recipients and wait for a yes before publishing it.

**Query it from Claude.** Datadog's remote MCP server: copy the endpoint for the user's site from Datadog's MCP setup page, then `claude mcp add --transport http datadog-mcp <endpoint>`; OAuth signs in, no key in the config. Users need the `mcp_read` and `mcp_write` permissions, which the Datadog Standard Role has. Limit tools with `?toolsets=` on the URL (e.g. `?toolsets=apm`). Not available on the US government sites.

**Limits.** Over the API rate limit you get HTTP 429 with `X-RateLimit-Limit`, `-Period`, `-Remaining`, `-Reset` and `-Name` headers; back off until `Reset`. Metric and log submission are not rate-limited (custom metrics count against the contract instead) and events cap at 250,000 a minute per org. Because custom metrics are billed under the contract and Datadog keeps OTLP logs off by default for billing reasons, ask before turning on log collection or adding new custom metrics.

## Incident triage (any platform)

1. **Scope**: what's broken, for whom, since when. Check the status page of the provider.
2. **What changed**: last deploy, config change, secret rotation, certificate expiry, dependency outage. Most incidents follow a change.
3. **Mitigate first**: roll back the last deploy, shift traffic to the previous revision, scale out, or flip the feature flag. Fix the root cause after users are fine.
4. **Evidence**: error-rate and latency graphs, the top error messages (aggregate, don't scroll), one failing trace end to end.
5. **Platform quick commands**:
   - Kubernetes: `kubectl get events --sort-by=.lastTimestamp`, `kubectl logs --previous`, `kubectl top pods`
   - Cloud Run: `gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=SVC' --limit 50`
   - Lambda: CloudWatch logs for `Task timed out`, `Runtime.ExitError`, `AccessDenied`; `Throttles` and `ConcurrentExecutions` metrics
   - Azure: activity log + KQL on `AppExceptions`/`AppRequests` (see [azure.md](azure.md))
   - Workers: Workers Logs/Traces, `wrangler tail`
6. **Write it down**: timeline, cause, fix, follow-up actions (alert that would have caught it sooner, test that prevents it).
