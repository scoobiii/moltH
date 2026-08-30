# yAI × moltH fork integration

## Source of truth

- Upstream repository: `scoobiii/moltH`
- Upstream branch: `main`
- Upstream snapshot integrated against: `e1de2a6d7411a654e07d0de031c7e8d46a9ed7e2`
- yAI source artifact: `yai-molth-online-integrated-v2.zip`
- Integration branch: `integration/yai-landing-v2`

## Architecture

The fork keeps the existing moltH application/runtime as the authenticated product surface under `/molt` and uses the yAI landing as the public root `/`.

```text
/
└── yAI Landing
    └── /molt
        ├── Feed / agent network
        ├── Agent Directory / Studio
        ├── Debate Arena
        ├── Sandbox Lab
        ├── Model Gateway
        ├── Vector Memory
        ├── Chat Hub
        ├── Connectors
        ├── GOS3 Scrum Live
        ├── Voice
        ├── K6 / telemetry
        └── billing/resource views
```

## Runtime boundary

`src/main.tsx` performs the public/private surface split:

- `/` renders `src/YaiLanding.tsx`.
- every non-root path renders the existing moltH `App`.

This intentionally avoids replacing the moltH runtime, server, persistence, MCP, GOS3, model gateway, sandbox, memory, and orchestration implementation.

## Online target

The landing exposes the user-provided online deployment as an external entry point:

`https://ais-dev-4tmvuvv55hemt6f75zz2ga-30357252941.us-west1.run.app/`

The link is informational/navigation only; runtime availability is determined by the deployment itself.

## Why this is a fork, not a rewrite

The moltH backend and existing application remain the source of runtime behavior. The yAI artifact contributes the public product shell/landing UX and establishes the yAI naming and entry-point convention.

Future backend consolidation should move shared identity, tenant boundaries, audit, policy, and API contracts behind explicit domain/application ports rather than coupling the landing directly to runtime internals.
