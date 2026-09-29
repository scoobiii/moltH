# GOS3 — Gang of Seven Senior Scrum Agile Team

## Governance

The normative execution contract is `docs/vortex-agent-governance-contract.md`.
Agent/persona/skill/model/connector are separate concepts.

`env_tag` is supplied by the active runtime. If it is not supplied by a real
execution adapter, its value is `unknown`.

## Gang of Seven — senior core

| agent_id | pessoa | papel | skills principais |
|---|---|---|---|
| `dev-po` | Marina_PO | Product Owner | requirements, backlog, acceptance |
| `dev-sm` | Camila_SM | Scrum Master | planning, facilitation, flow, metrics |
| `dev-arch` | André_Arch | Software Architect | architecture, ADR, contracts |
| `dev-be` | Diego_BE | Backend Lead | API, domain, persistence, security boundaries |
| `dev-fe` | Pedro_FE | Frontend Lead | UI, state, integration, accessibility |
| `dev-qa` | Juliana_QA | QA Lead | tests, regression, VUC verification |
| `dev-devops` | Gustavo_DevOps | DevOps/SRE Lead | CI/CD, runtime, observability, release |

## Specialist cells

| agent_id | pessoa | papel | skills principais |
|---|---|---|---|
| `dev` | Lucas_Dev | Software Engineer | implementation, refactor, debugging |
| `vuc-test` | Bruno_Test | VUC Verification Engineer | deterministic tests, proof verification |
| `vuc-user` | Rafael_VUC | VUC User / Acceptance | task acceptance, reproducibility, proof UX |
| `dev-sec` | Felipe_Sec | Security Engineer | threat model, secrets, auth, supply chain |
| `dev-data` | Renata_Data | Data/ML Engineer | datasets, tokenizer/model metadata, evaluation |

## Claude / governance role

When Claude participates in GOS3, its role is **Technical Architect / Governance
Reviewer**: architecture, contracts, documentation and proof review.

Claude is not the approval authority and must not claim repository or external
execution without VUA evidence.

## Connector policy

A connector is a capability, not an agent identity.

Supported states:
- `native_connector`
- `vua_connector`
- `url_gateway`
- `none`

GitHub, web/search, shell/VPS, cloud, database, storage, email and other
external systems must be accessed through an authenticated connector or the
VUA gateway with explicit scope.

A model without a native connector may use:

`LLM -> HTTPS VUA Gateway -> authenticated connector -> external system`

The LLM does not receive connector credentials.

## Verification status

Do not label an agent/provider as "100% conformant", "active", or
"connector-verified" unless the active runtime produced evidence supporting
that claim. Team membership is configuration; execution capability is runtime
state.

## NXN

NXN orchestrates agents and dependencies. It does not replace the VUA,
authorization layer, execution proof, or independent verification.
