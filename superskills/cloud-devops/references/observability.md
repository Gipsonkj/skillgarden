# Observability and incident triage

> Distilled from: opentelemetry (grafana/skills, Apache-2.0), grafana-dashboards (wshobson/agents, MIT), workers-best-practices (cloudflare/skills, Apache-2.0), aws-lambda (awslabs/agent-plugins, Apache-2.0), azure-diagnostics (microsoft/azure-skills, MIT), kubernetes-specialist (Jeffallan/claude-skills, MIT)

## Minimum for anything in production

1. **Structured JSON logs** with timestamp, level, message, request/trace ID, and no secrets or personal data.
2. **Resource attributes on every signal**: `service.name`, `service.namespace`, `service.version`, `deployment.environment`.
3. **RED metrics** per service: Rate (req/s), Errors (error rate %), Duration (p50/p95/p99 latency).
4. **USE metrics** per resource: Utilization, Saturation (queue length, throttles), Errors.
5. **Traces** across service hops (W3C `traceparent` propagation).
6. **Alerts** on symptoms users feel: error rate and p95/p99 latency against an SLO, plus saturation (disk, memory, queue age). Each alert links a runbook.

Platform switches: Cloudflare Workers need `observability.enabled` **and** `observability.traces.enabled`; Lambda uses Powertools (logs, EMF metrics, X-Ray); Azure uses Application Insights connected to Log Analytics; Cloud Run logs go to Cloud Logging automatically.

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
