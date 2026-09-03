# Team — Vortex GOS3 + moltH Runtime

> **Canonical boundary:** Agent != Runtime. Vortex agents are sovereign **proposers/reviewers**; moltH is the execution runtime. NxN proposes/reviews; Nx1 executes.
>
> Canonical specification: `docs/VORTEX-SOVEREIGN-AGENTS.md`.

## Canonical Vortex Gang of Seven

| Agent | Role | Execution authority | Provider/model | Status |
|:---|:---|:---:|:---|:---:|
| **Gemini** | Proposer / multimodal reviewer | **No** | Google Gemini | Active |
| **Claude** | Proposer / software architecture reviewer | **No** | Anthropic Claude | Active |
| **GPT** | Proposer / general reasoner | **No** | OpenAI GPT | Active |
| **Qwen** | Proposer / code & numerical specialist | **No** | Alibaba Qwen | Active |
| **DeepSeek** | Proposer / formal reasoning reviewer | **No** | DeepSeek | Active |
| **Manus** | Proposer / implementation planner | **No** | Manus | Active |
| **Perplexity** | Proposer / research & grounding reviewer | **No** | Perplexity | Active |

**Grok/xAI** may participate as an external proposer/reviewer. It is not part of the canonical seven and is not the moltH runtime.

## Sovereign runtime

| Component | Role | Execution authority | Provenance |
|:---|:---|:---:|:---|
| **moltH** | Sovereign runtime / control plane | **Yes** | `runtime_id` returned by each real execution receipt |

The runtime owns the execution boundary: sandboxing, tool/connector authorization, persistence, output capture and evidence generation. An agent/model provider never becomes the runtime merely because it can generate text or has an API credential.

## GOS3 execution contract

Every executable action follows:

```text
Vortex proposer
      |
      | GOS3 invocation-contract v0.1
      v
moltH runtime
      |
      +--> authorization
      +--> sandbox / connector
      +--> actual execution
      +--> stdout / stderr / exit_code / duration
      v
receipt
  + runtime_id
  + evidence_hash
```

`executed: true` is reserved for work actually performed by the runtime. `auth_required`, `timeout`, `error`, `local_simulation` and other non-success states must not be relabeled as successful external-provider execution.

## Governance rules

1. **No hidden execution privilege:** proposers cannot bypass the runtime boundary.
2. **Provenance separation:** `agent`, `provider/model` and `runtime_id` are independent fields.
3. **Evidence required:** executable claims require a receipt and evidence hash.
4. **Zero Fake Provider:** missing provider credentials must be represented honestly.
5. **NxN/Nx1:** many agents may propose or review; one compatible runtime executes a given invocation.

## References

- `docs/VORTEX-SOVEREIGN-AGENTS.md`
- `docs/SPRINT-0-VORTEX-CONTRACT.md`
- `docs/GOS3-SPECIFICATION.md`
- Vortex canonical roster: `scoobiii/vortex` → `README.md`
