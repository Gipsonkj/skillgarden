# AWS: IAM, Lambda, containers, CDK

> Distilled from: aws-iam and aws-containers (aws/agent-toolkit-for-aws, Apache-2.0), aws-lambda (awslabs/agent-plugins, Apache-2.0), aws-cdk-development (zxkane/aws-skills, MIT), terraform-skill (antonbabenko/terraform-skill, Apache-2.0)

Verify limits, quotas, runtime versions and API names against current AWS docs; they change. Confirm the account and region first: `aws sts get-caller-identity` and `aws configure get region`.

## IAM

### Roles for every resource you create

1. Decide which roles the task needs: **service roles** (a service acts for you, e.g. Glue reading S3) and **execution roles** (runs your code, e.g. Lambda, ECS task role). Some services use service-linked roles instead.
2. Don't skip role creation by assuming a "pre-existing role" unless the user gave an ARN.
3. Trust policy: principal is the service that actually calls `sts:AssumeRole` (`lambda.amazonaws.com`, `ecs-tasks.amazonaws.com`, ...). Add confused-deputy conditions: `aws:SourceAccount` = account ID and `aws:SourceArn` = the exact resource ARN when known.
4. Permissions policy: specific resource ARNs; separate statements by purpose (read source vs write target); scope CloudWatch Logs to `arn:aws:logs:REGION:ACCOUNT:log-group:NAME:*`. Never `"Action": "*"` with `"Resource": "*"`.
5. Trust policy goes in `AssumeRolePolicyDocument`, not in the permissions policy.

### Edge cases agents get wrong

- `ForAllValues:` on a missing/empty key evaluates **true**. Pair it with `"Null": {"<same key>": "false"}`.
- `iam:PassRole` on `Resource: "*"` plus create/update on a compute service (EC2 RunInstances, Lambda CreateFunction, ECS RegisterTaskDefinition, Glue, SageMaker, CloudFormation) = escalation to any role, including admin. Scope to role ARNs/path; optionally `iam:PassedToService`.
- Direct escalation actions to guard: `PutUserPolicy`, `PutRolePolicy`, `PutGroupPolicy`, `CreatePolicy`, `CreatePolicyVersion`, `AttachUserPolicy`, `AttachRolePolicy`, `AttachGroupPolicy`.
- Role chaining caps sessions at 1 hour. Managed policies keep at most 5 versions.
- Resource policies granting to an IAM user ARN bypass that user's permissions boundary in the same account.
- Cross-account AssumeRole into an opt-in region: the **target** account must enable the region.
- Redshift Serverless trust needs both `redshift-serverless.amazonaws.com` and `redshift.amazonaws.com`.
- OIDC providers mostly don't need thumbprints any more.
- GitHub OIDC trust: `aud = sts.amazonaws.com`, `sub` pinned to `repo:ORG/REPO:ref:refs/heads/main` (or an environment). No wildcards.
- Generating a policy from application code or a Terraform plan JSON: AWS's `iam-policy-autopilot` tool exists for this; otherwise map each SDK call to its IAM action using the Service Authorization Reference, not memory.

## Lambda and serverless

Defaults the AWS skill uses: IaC = CDK, language = TypeScript, unless the user says SAM/CloudFormation or Python.

### Limits that bite

| Limit | Value |
|---|---|
| Timeout | 900 s (15 min) |
| Memory | 128–10,240 MB; 1 vCPU at 1,769 MB |
| Sync payload | 6 MB request / 6 MB response; async 1 MB; streamed 200 MB |
| Zip package | 50 MB zipped upload, 250 MB unzipped; container image 10 GB |
| Env vars | 4 KB total |
| `/tmp` | 512 MB–10 GB |
| Concurrency | 1,000 per region default; burst +1,000 per 10 s |

Concurrency ≈ requests/s × average duration in seconds.

### Rules

- Handlers are **idempotent**: delivery is at least once. Use Powertools Idempotency (DynamoDB) for side effects.
- Create SDK clients and DB connections outside the handler; never keep per-user data in module scope (environments are reused).
- Secrets in Secrets Manager / SSM Parameter Store, not env vars.
- Use Powertools for structured logs, metrics (EMF), tracing, batch processing.
- arm64 is ~20% cheaper per GB-second; use x86 only for x86-only native deps.
- Right-size memory with Lambda Power Tuning (test 128, 256, 512, 1024, 1769, 3008 MB; 50–100 invocations each). CPU-bound code usually wants ≥ 1,769 MB.
- Provisioned concurrency only for latency-critical sync endpoints; SnapStart for Java/Python/.NET cold starts (generate unique values inside the handler, re-validate connections after restore).
- Put SQS in front to absorb spikes; set reserved concurrency to protect or cap functions.
- Async invokes are always accepted and retried up to 6 h; configure a DLQ or on-failure destination. EventBridge targets need `RetryPolicy` + `DeadLetterConfig`; Step Functions Task states need `Retry` on `Lambda.ServiceException`/`Lambda.AWSLambdaException`.
- In a VPC, reach AWS services through VPC endpoints rather than NAT.
- Long multi-step flows: Step Functions (or Lambda durable functions); don't chain Lambdas synchronously.

### Troubleshooting

| Error | Fix |
|---|---|
| `Task timed out after X seconds` | Raise timeout and/or memory, find the slow call (X-Ray) |
| `Runtime.ExitError` | OOM or crash: raise memory, check leaks |
| `AccessDeniedException` | Add the specific action to the execution role |
| `TooManyRequestsException` / 429 | Reserved concurrency, quota increase, SQS buffer |
| `IteratorAge` rising (Kinesis/DDB streams) | Raise `ParallelizationFactor` and `BatchSize` |
| Stack in `ROLLBACK_COMPLETE` | Read CloudFormation events for the first failure; the stack must be deleted (ask) before redeploying |
| CORS errors | Configure CORS on API Gateway and return headers from the function (incl. error responses) |

## Containers: ECS, EKS, ECR

- **ECS on Fargate** is the simplest path for a container service (ECS Express Mode for quick web apps; App Runner is closed to new customers). Task role (app permissions) ≠ task execution role (pull image, write logs).
- Enable deployment circuit breaker with rollback; when debugging control-plane failures (rollbacks, placement, scaling), check ECS Action Logs.
- `aws ecs execute-command` (ECS Exec) for shell access; needs SSM permissions on the task role.
- **ECR**: enable scan on push, immutable tags for release repos, lifecycle policy (e.g. keep last 20 tagged, expire untagged after 7 days).
- **EKS**: see [kubernetes.md](kubernetes.md). Pod-level AWS access via EKS Pod Identity or IRSA.
- **Elastic Beanstalk** still exists for classic platform deploys; prefer containers for new work.

## CDK

- Don't set optional physical names (`functionName`, `bucketName`); let CDK generate them so stacks can deploy twice and in parallel.
- Separate environments by **account**, not by name prefixes.
- `NodejsFunction` (esbuild bundling) for TS/JS, `PythonFunction` for Python.
- Add `cdk-nag` (`Aspects.of(app).add(new AwsSolutionsChecks())`); suppress findings only with a written reason.
- Loop: build → unit/snapshot tests → `cdk synth` → `cdk diff` (review replacements and deletions) → `cdk deploy` to the confirmed account.
- Don't hardcode account/region; use `env` from context or `CDK_DEFAULT_ACCOUNT`.

## Cost reminders

NAT gateways, idle load balancers, provisioned concurrency, and cross-AZ/region data transfer are the usual surprise bills. Tag everything (`Project`, `Environment`, `Owner`) and set a budget alarm.
