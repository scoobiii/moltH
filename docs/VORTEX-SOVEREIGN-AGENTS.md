# Vortex GOS3 — Sovereign Agent Model

## Canonical rule

A Vortex agent is a **sovereign proposer**, not a sovereign execution runtime.

- **Agent**: identity, role, proposal, reasoning, provenance and request intent.
- **moltH runtime**: execution authority, sandbox, connectors, tools, persistence and evidence.
- **Vortex**: invocation contract, provenance rules and governance.

Therefore:

> Agent != Runtime
>
> NxN proposes/reviews; Nx1 executes.

An agent MUST NOT claim that it executed a shell command, tool call, connector operation or code unless the moltH runtime returned a receipt with `executed: true`, `runtime_id`, output and `evidence_hash`.

## GOS3 Gang of Seven

The canonical Vortex proposer roster is:

1. Gemini
2. Claude
3. GPT
4. Qwen
5. DeepSeek
6. Manus
7. Perplexity

Grok/xAI may participate as an external proposer or reviewer, but it is not part of the canonical seven and is not the sovereign runtime.

## Execution boundary

```text
                    VORTEX GOS3
              contract + governance
                         |
                 NxN proposal/review
                         |
              +----------v----------+
              |  Sovereign Proposer |
              | identity + intent   |
              +----------+----------+
                         |
                  invocation v0.1
                         |
              +----------v----------+
              |    moltH Runtime    |
              | execution authority |
              | sandbox/connectors   |
              | WAL + evidence      |
              +----------+----------+
                         |
                 receipt + hashes
                         |
              runtime_id + evidence_hash
```

## Runtime identity

`runtime_id` identifies the environment that actually produced the execution evidence. It MUST NOT be inferred from the agent name or model provider.

The current moltH implementation derives a runtime identifier from the running host/process context. The identifier is evidence metadata; it is not, by itself, a security certification.

## Provider truth

A model provider (`gemini`, `grok`, `claude`, `gpt`, `deepseek`, `qwen`, etc.) is not a runtime. API availability does not grant execution authority.

When a provider credential is absent, the system MUST expose the actual fallback state (`local_simulation`, local SLM, `auth_required`, `not_executed`, etc.) rather than presenting the external provider as the executor.

## Acceptance criteria

A Vortex proposer integration is compliant when:

- the seven canonical agents are represented as proposers;
- no proposer is marked as the execution authority;
- every executable invocation crosses the GOS3 contract boundary;
- receipts contain `executed`, `runtime_id` and `evidence_hash` when execution occurs;
- failed, simulated or unauthenticated work cannot be represented as successful execution;
- provenance distinguishes agent identity, model provider and runtime identity.
