# Architecture — 100% Coverage + K6 Runtime Verification

## Decision

moltH uses two independent verification planes:

1. **Source coverage (Vitest/V8)** — 100% lines, functions, branches and statements for every module explicitly declared in the architectural coverage scope.
2. **Runtime coverage (K6)** — 100% of the declared runtime scenarios/endpoints/critical paths for the K6 contract. K6 is not substituted for V8 source instrumentation.

The threshold is never reduced to make CI pass.

## Coverage boundary

The denominator is explicit and reviewable. A module enters the 100% gate when its architecture contract declares it testable in that gate.

For the Vortex Enforcement PR the scope is:

- `src/lib/deliverableTruthGate.ts`
- `src/components/agents/GOS3SystemInstructionInjector.tsx`

Both are governance-critical and must remain at:

- lines: 100%
- functions: 100%
- branches: 100%
- statements: 100%

Legacy/UI modules outside this boundary are not silently declared "covered"; they require their own test contract before being added.

## Test ownership

Coverage is per production module, not per test file.

- `Header.tsx` -> `Header.test.tsx`
- `App.tsx` -> `App.test.tsx`
- `GOS3SystemInstructionInjector.tsx` -> its dedicated Vitest/RTL suite
- `deliverableTruthGate.ts` -> its dedicated unit suite

A test may exercise dependencies, but ownership remains with the module whose executable branches are being measured.

## K6 contract

K6 validates runtime behavior, not V8 source-line coverage.

Each K6 suite must declare:

- endpoint/scenario identifier;
- preconditions;
- success assertion;
- failure assertion where applicable;
- P0/critical-path classification;
- deterministic test data;
- evidence/receipt expected from the runtime.

A CI K6 gate is therefore expressed as "all declared runtime scenarios passed", while the Vitest gate remains "100% source coverage for the declared source boundary".

## Promotion rule

A module is promoted into the global 100% source gate only when:

1. its test suite exists;
2. all four V8 metrics are 100%;
3. critical branches have explicit positive and negative tests;
4. its runtime contract, when applicable, has K6 coverage;
5. the change does not introduce a new untested branch.

This creates a monotonic path from the current governance core to eventual whole-product 100% coverage without using exclusions to hide untested code.
