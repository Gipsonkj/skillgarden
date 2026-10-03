# Azure: deploy with azd, diagnose production

> Distilled from: azure-deploy, azure-diagnostics, azure-app-onboard (microsoft/azure-skills, MIT)

Scripts (read-only collectors, from azure-diagnostics): `scripts/azure-diagnostics/containerapp-diagnostics.sh` and `scripts/azure-diagnostics/appservice-diagnostics.sh`.

## Hard rules

1. **Never assume subscription or region.** Show the current one (`az account show --query "{name:name,id:id}"`) and ask the user to confirm both.
2. **Destructive or costly actions need an individual yes**: `az group delete`, `azd down`, Key Vault purge, storage/database deletes, RBAC/access policy changes, large SKU bumps. Deploying is never consent to delete.
3. Don't `az group delete --no-wait` and then recreate the same name: background deletion takes 5–15 min and will delete the new group. Use a new name or `az group wait --name RG --deleted --timeout 900`.
4. Present endpoints as full `https://` URLs (CLI often returns bare hostnames).
5. Secrets go to Key Vault; app reads them via managed identity. Passwords used in connection-string URLs must be URL-safe (no `# @ / ? % : & = + ;`). Never echo secret values.

## Flow for bringing an app to Azure

Discover (stack, services, data stores) → architect (pick services, estimate monthly cost, list rejected alternatives) → **scaffold approval gate** (show plan before writing IaC) → scaffold `azure.yaml` + `infra/` (Bicep or Terraform) → validate → **deploy approval gate** ("Ready to deploy? Yes / run manually / edit plan / cancel") → deploy → health-check → hand off (endpoints, identity used, cleanup command, next steps). Region, service type or SKU changes after approval need re-approval.

Typical service picks: Static Web Apps (static/SPA), App Service (classic web apps), Container Apps (containers, scale to zero), Functions (event-driven), AKS (only with a platform team), Azure SQL / PostgreSQL Flexible Server / Cosmos DB, Key Vault, Application Insights + Log Analytics.

## azd deploy sequence

```bash
azd env new myapp-dev --no-prompt          # 1. environment first
azd env set AZURE_SUBSCRIPTION_ID <id>     # 2. confirmed subscription
az group show -n rg-myapp-dev 2>/dev/null  # 3. does the RG already exist? check tags/resources
azd env set AZURE_LOCATION westeurope      # 4. confirmed region
azd env get-values                         # 5. verify
azd up --no-prompt                         # 6. provision + deploy (or azd provision / azd deploy)
```

Common mistakes: `azd up --location X` instead of `azd env set AZURE_LOCATION`; running `azd up` with no environment; ignoring existing resources/tags in the target RG; not checking for an existing Container Apps environment (quota is per region).

Container Apps + ACR with managed identity: run `azd provision` first and confirm the `AcrPull` role assignment has propagated before `azd deploy`, or the first image pull fails.

## azd / deploy errors

| Error | Fix |
|---|---|
| `language 'html' is not supported` | Omit `language` for pure static Static Web Apps; valid: python, js, ts, java, dotnet, go |
| `unable to find a resource tagged with 'azd-service-name: web'` | Add tag `azd-service-name: <service>` to the resource in Bicep, `azd provision`, then `azd deploy` |
| `LocationNotAvailableForResourceType` | Service not in that region; pick a supported region |
| SWA stuck "Uploading" / default page | Fix `project`/`dist`: static in root → `project: .`, `dist: public` (can't use `dist: .` with `project: .`) |
| 403 on subscription-scope deployment | Switch Bicep to resource-group scope, create the RG with CLI, deploy with `az deployment group create`; if still 403, user needs Contributor on the RG |
| Terraform via azd: Go-style `{{ }}` in tfvars | Use `${VAR}` syntax in `main.tfvars.json` |

For deployments with > 5 resources, poll failed operations: `az deployment operation group list -g RG -n NAME --query "[?properties.provisioningState=='Failed']" -o table` and fix all errors in one pass.

## Diagnosis flow

1. **Symptom**: what fails, since when, for whom.
2. **Platform health**: `az resource show --ids ID`, Resource Health, `az monitor activity-log list -g RG --max-events 20` (recent changes!).
3. **Logs**: App Insights / Log Analytics (KQL below), `az containerapp logs show`, `az webapp log tail`.
4. **Metrics**: CPU, memory, request rate, failures, latency.
5. **Recent changes**: deployments, config, RBAC, certificates.
Record what you checked and what you changed.

Quick collectors:

```bash
bash scripts/azure-diagnostics/containerapp-diagnostics.sh --name APP --resource-group RG [--subscription ID]
# revisions, registry config, ingress config, last 20 log lines
bash scripts/azure-diagnostics/appservice-diagnostics.sh --name APP --resource-group RG [--subscription ID]
# state/runtime/health path/alwaysOn, last 3 deployments, app setting NAMES (no values), custom domains
```

### Container Apps

| Symptom | Likely cause | Fix |
|---|---|---|
| Image pull failure | Registry auth missing | `az containerapp registry set -n APP -g RG --server ACR.azurecr.io --identity system` |
| `az acr build` "ACR Tasks is not supported" | Free subscription | Build and push locally with Docker |
| First request very slow | `min-replicas 0` | `az containerapp update -n APP -g RG --min-replicas 1` |
| 502/503 after start | Ingress `targetPort` ≠ app port | Match `targetPort`, Dockerfile `EXPOSE`, and the app's listen port |
| Restart loop | Health probe failing | Make `/health` return 200 quickly |

### App Service

| Symptom | Check |
|---|---|
| High CPU/memory | `az monitor metrics list --resource ID --metric "CpuPercentage,MemoryPercentage" --interval PT1M`; Kudu Process Explorer; scale up plan |
| Deploy failure | `az webapp deployment list`, `az webapp log deployment show`, Kudu `/api/deployments` |
| 502/503 | STDERR logs, startup command, port |
| TLS/domain | `az webapp config ssl list`, CNAME/TXT records |
| Health check failing | Path must return 200 within ~2 min of start |

### Functions

Find linked App Insights (Resource Graph join on the resource group, or read `APPLICATIONINSIGHTS_CONNECTION_STRING` setting name). Common causes: missing app settings, binding/connection errors, timeouts on Consumption plan, cold starts (Premium/Flex with always-ready instances).

### AKS, VMs, messaging

- AKS: cluster access → nodes → `kube-system` → workload; general k8s triage in [kubernetes.md](kubernetes.md).
- VM can't RDP/SSH: NSG rules for 3389/22, OS firewall, VM agent status, reset credentials via `az vm user update` (ask first).
- Service Bus / Event Hubs: AMQP failures are usually firewall (ports 5671/5672, or use WebSockets on 443), wrong auth (prefer managed identity + data-plane roles), or lock-lost from processing longer than lock duration.

## KQL starters (App Insights / Log Analytics)

```kql
AppExceptions | where TimeGenerated > ago(1h) | project TimeGenerated, Message, StackTrace | order by TimeGenerated desc
AppRequests | where TimeGenerated > ago(1h) and Success == false | summarize count() by Name, ResultCode | order by count_ desc
AppRequests | where TimeGenerated > ago(1h) and DurationMs > 5000 | project TimeGenerated, Name, DurationMs | order by DurationMs desc
AppDependencies | where TimeGenerated > ago(1h) and Success == false | summarize count() by Name, ResultCode, Target
```

Always filter on time first, aggregate with `summarize`, cap with `take 50`.
