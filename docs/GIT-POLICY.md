# GOS3 Git Policy — Single Source of Truth

**Status:** REQUIRED
**Scope:** all human and agent sessions working on this repository
**Branch:** `main`

## 1. Core rule

`main` is a shared trunk. No session may assume that `origin/main` is unchanged since its last fetch.

**Before every push, synchronize first.**

Required sequence:

```bash
git fetch origin
git rebase origin/main
git push origin main
```

If the working tree is dirty, preserve it before synchronization:

```bash
git stash push -u -m "GOS3 pre-sync: preserve multi-session work"
git fetch origin
git rebase origin/main
git push origin main
git stash pop
```

Never use `git push --force` on `main`.

## 2. Commit-before-sync rule

A session must not run `git pull --rebase` while it has unstaged/uncommitted work. The work must either be committed as a coherent unit or stashed with `-u` before synchronization.

## 3. Push gate (ADR-004: Green-to-Main Gate & ADR-006: DELIVERABLE-TRUTH)

Em conformidade estrita com o **ADR-004** e o **ADR-006** (`docs/ADR-006-DELIVERABLE-TRUTH-GATE.md`), um push ou merge em `main` é permitido única e exclusivamente quando:

1. As alterações locais estão preservadas e sincronizadas;
2. `origin/main` foi buscado (`fetch`) imediatamente antes do push;
3. O `main` local foi rebaseado no `origin/main` recente;
4. O working tree está no estado canônico esperado;
5. **Portão de CI 100% Verde (ADR-004)**: Todos os testes automatizados (`npm test` / `vitest`) e o linter (`npx tsc --noEmit`) passaram com exit code 0;
6. **Portão DELIVERABLE-TRUTH (ADR-006)**: Validação com `COMPLIANCE_PASS` em todos os domínios P0 (`wallet`, `pix`, `drex`, `financial`, `banking`, `payment`, `settlement`, `balance`, `account`, `secret`, `credential`);
7. **Regra 7 Vinculante**: Proibido declarar `PASS` ou aprovação com bloqueio de deliverable-truth pendente;
8. O `evidence_hash = sha256(stdout + stderr + exit_code + duration_ms)` do run de testes foi computado e registrado;
9. Nenhum segredo, mock mascarado ou arquivo gerado temporário foi staged;
10. É estritamente proibido o uso de `git push --force` ou `--no-verify`.

## 4. Divergence handling

If `git push` reports `non-fast-forward`, **do not force push**.

Run:

```bash
git stash push -u -m "GOS3 pre-sync: recover after push rejection"
git fetch origin
git rebase origin/main
git push origin main
git stash pop
```

If rebase conflicts occur, stop and resolve them explicitly. Do not discard another session's commits.

## 5. Multi-session ownership

All sessions — Claude, Gais/Gemini, GPT, human PO, or other GOS3 agents — follow this exact policy. There is no privileged "master developer" that may skip synchronization.

The role distinction is governance, not Git safety:

- **PO:** authorizes protected/spec/security changes.
- **Proposer/agent:** implements an authorized change.
- **Any session:** must synchronize before publishing.

## 6. Stash discipline

Never blindly run `git stash pop` if the tree has changed since the stash was created. Inspect first:

```bash
git status --short
git stash list
git diff
```

When the stash contains unrelated work from another session, keep it intact and separate it into a later commit.

## 7. Generated/untracked artifacts

Do not stage arbitrary shell output, temporary files, backups, `.orig`, `.rej`, package backups, or command transcript fragments merely to make the tree clean.

Examples from previous incidents include files resembling:

- `*.bak.*`
- `*.orig`
- `*.rej`
- command-output fragments
- temporary test output

Inspect and classify before adding.

## 8. Preferred one-command automation

For routine publishing, use a repository-local gate script when available. It must implement the same invariant:

```text
preserve dirty work
→ fetch origin
→ rebase origin/main
→ validate
→ push
→ restore preserved work
```

Automation must fail closed on conflicts, failed tests, or ambiguous state. It must never force-push `main`.

## 9. Rationale

GitHub rejects non-fast-forward pushes when the remote contains commits that the local branch does not contain, specifically to prevent loss of remote history. Fetching and integrating the remote work before pushing is the required safety boundary.

This policy exists because multiple GOS3 sessions can commit concurrently. The remote repository is the shared coordination point; every publisher must synchronize against it immediately before publication.
