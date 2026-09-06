#!/usr/bin/env python3
"""GOS3 Deliverable Truth Gate — P0.

Falha (exit 1) se encontrar, em código de PRODUÇÃO:
  R1. mock/fake/simulation/stub fora de quarentena;
  R2. dado financeiro fictício como implementação real
      (PIX/chave/saldo/limite hardcoded, evidence_hash placeholder);
  R5. mock de teste importado pelo runtime (mock escape);
  R6. (via --deliverables) entregável alterado sem seu teste dono executado;
  R7. (via --chain + --rash) cadeia de execução inválida ou task_rash
      commitado divergente do recomputado — derrota reordenação, remoção
      de passos e "execução resumida" forjada.

Quarentena reconhecida: __mocks__/, __fixtures__/, *.mock.*, *.fixture.*,
*.stub.*, tests/, test/, spec/, e2e/.

P0: wallet / PIX / financial / secret nunca são rebaixados a warning.

Uso:
    python3 deliverable_truth_gate.py --root /path/do/repo [--deliverables JSON]
                                     [--chain execution_chain.json --rash .task_rash]
"""
import hashlib
import json
import os
import re
import sys
import argparse

# ---------------------------------------------------------------- padrões
# R1: marcadores de simulação fora de quarentena
SIMULATION_MARKERS = [
    re.compile(r'\bmock\b', re.I),
    re.compile(r'\bfake\b', re.I),
    re.compile(r'\bsimulat\w*\b', re.I),
    re.compile(r'\bstub\b', re.I),
    re.compile(r'\bplaceholder\b', re.I),
    re.compile(r'\blorem\b', re.I),
]
# R2: financeiro fictício / prova fabricada (P0)
FINANCIAL_P0 = [
    (re.compile(r"""pix\s*[:=]\s*['"][^'"]+@molth['"]""", re.I),
     "chave PIX fictícia hardcoded (@molth)"),
    (re.compile(r"""balance_limit\s*[:=]\s*\d+""", re.I),
     "balance_limit hardcoded sem backend real"),
    (re.compile(r"""sha256:[0-9a-f]{1,63}(?![0-9a-f])""", re.I),
     "evidence_hash placeholder (não tem 64 hex)"),
    (re.compile(r"""sha256:x\b""", re.I),
     "evidence_hash 'sha256:x' — fabricação explícita"),
    (re.compile(r"""\b\d{3}\.\d{3}\.\d{3}-\d{2}\b"""),
     "CPF com formato real em código (dado sensível/mock)"),
]
# R5: escape de mock — import de quarentena a partir de prod
MOCK_ESCAPE = [
    re.compile(r"""from\s+['"].*__mocks__/.*['"]"""),
    re.compile(r"""import\s*\(?\s*['"].*__mocks__/.*['"]"""),
    re.compile(r"""require\s*\(\s*['"].*__mocks__/.*['"]\s*\)"""),
    re.compile(r"""from\s+['"].*\.mock(\.|['"])"""),
    re.compile(r"""from\s+['"].*\.fixture(\.|['"])"""),
]
# arquivos que o gate inspeciona
CODE_EXT = (".ts", ".tsx", ".js", ".jsx", ".py")

QUARANTINE_DIR_HINTS = ("__mocks__", "__fixtures__", "/tests/", "/test/",
                        "/spec/", "/e2e/", "node_modules", ".git/", "/scripts/", "scripts/")
QUARANTINE_FILE_HINTS = (".mock.", ".fixture.", ".stub.", ".test.", ".spec.", "deliverableTruthGate", "deliverable_truth_gate")


def in_quarantine(path: str) -> bool:
    p = path.replace(os.sep, "/")
    if any(h in p for h in QUARANTINE_DIR_HINTS):
        return True
    return any(h in p for h in QUARANTINE_FILE_HINTS)


def is_html_input_placeholder(line: str) -> bool:
    """Ignora atributos HTML/JSX válidos de input/textarea (ex: placeholder="...") e classes Tailwind."""
    cleaned = re.sub(r'placeholder-(?:\[[^\]]+\]|[a-zA-Z0-9-]+)', '', line)
    cleaned = re.sub(r'placeholder:(?:\[[^\]]+\]|[a-zA-Z0-9-]+)', '', cleaned)
    cleaned = re.sub(r'placeholder\s*=\s*["\'{][^"\']*["\'}]?', '', cleaned)
    cleaned = re.sub(r'placeholder\s*:\s*["\'][^"\']*["\']?', '', cleaned)
    cleaned = re.sub(r'placeholder\?:\s*string', '', cleaned)
    return 'placeholder' not in cleaned.lower()


def is_anti_simulation(line: str) -> bool:
    """Ignora declarações de 'sem simulação', 'zero-simulation', 'sem mock', etc."""
    return bool(re.search(r'(zero|anti|proibi|sem|no|non)[ -_]?(simulat|mock|fake|stub)', line, re.I))


def scan_file(path: str, violations: list):
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
    except OSError:
        return
    quarantined = in_quarantine(path)
    for i, line in enumerate(lines, 1):
        # R5 vale em qualquer lugar: prod importando mock é sempre violação
        for pat in MOCK_ESCAPE:
            if pat.search(line):
                violations.append(
                    ("P0", "R5-mock-escape", path, i,
                     "código importa mock de quarentena para o runtime"))
        if quarantined:
            continue
        for pat in SIMULATION_MARKERS:
            if pat.pattern == r'\bplaceholder\b' and is_html_input_placeholder(line):
                continue
            if is_anti_simulation(line):
                continue
            if pat.search(line):
                violations.append(
                    ("P0", "R1-simulacao-em-prod", path, i,
                     f"marcador de simulação fora de quarentena: {pat.pattern}"))
        for pat, desc in FINANCIAL_P0:
            if pat.search(line):
                violations.append(("P0", "R2-financeiro-ficticio", path, i, desc))


def check_deliverables(root: str, manifest_path: str, violations: list):
    """R6: manifest JSON {entregavel: [testes_donos]}; falha se o teste dono
    não existir ou não tiver rodado (marcador .ci-passed ausente)."""
    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)
    for deliverable, owners in manifest.items():
        if deliverable.startswith("_"):
            continue
        for owner in owners:
            owner_path = os.path.join(root, owner)
            if not os.path.exists(owner_path):
                violations.append(
                    ("P0", "R6-entregavel-sem-teste", deliverable, 0,
                     f"teste dono ausente: {owner}"))
            # marcador simples de execução: arquivo .passed ao lado do teste,
            # escrito pelo CI após execução com exit 0
            marker = owner_path + ".passed"
            if os.path.exists(owner_path) and not os.path.exists(marker):
                violations.append(
                    ("P0", "R6-teste-nao-executado", deliverable, 0,
                     f"teste dono não executado neste CI: {owner}"))


# ---------------------------------------------------------------- R7: rash
def _sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def _record_hash(rec: dict) -> str:
    canonical = "\n".join([
        str(rec["seq"]),
        rec["prev_hash"],
        rec["invocation_id"],
        rec["runtime_id"],
        rec["stdout"],
        rec["stderr"],
        str(rec["exit_code"]),
        str(rec["duration_ms"]),
        rec["evidence_hash"],
        rec["timestamp_iso"],
    ])
    return _sha256_hex(canonical)


def check_task_rash(chain_path: str, rash_path: str, violations: list):
    """R7: verifica a cadeia de execução e o task_rash commitado.

    Derrota: conteúdo adulterado, prev_hash quebrado (reordenação/remoção),
    evidence_hash divergente, elo sem runtime_id, genesis adulterado, e
    task_rash commitado != recomputado (ataque da "execução resumida").
    Implementação independente do produtor da cadeia (execution_chain.py):
    o verificador não confia, recomputa.
    """
    try:
        with open(chain_path, encoding="utf-8") as f:
            records = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        violations.append(("P0", "R7-cadeia-ilegivel", chain_path, 0,
                           f"não foi possível ler a cadeia: {e}"))
        return
    if not records:
        violations.append(("P0", "R7-cadeia-vazia", chain_path, 0,
                           "cadeia de execução vazia"))
        return
    for i, rec in enumerate(records):
        if rec.get("record_hash") != _record_hash(rec):
            violations.append(
                ("P0", "R7-elo-adulterado", chain_path, i,
                 f"elo {i}: record_hash não confere (conteúdo adulterado)"))
            return
        if i > 0 and rec.get("prev_hash") != records[i - 1].get("record_hash"):
            violations.append(
                ("P0", "R7-cadeia-quebrada", chain_path, i,
                 f"elo {i}: prev_hash quebrado (reordenação/remoção de passo)"))
            return
        if i > 0:
            recomputed = _sha256_hex(
                f"{rec['stdout']}\n{rec['stderr']}\n"
                f"{rec['exit_code']}\n{rec['duration_ms']}")
            if recomputed != rec.get("evidence_hash"):
                violations.append(
                    ("P0", "R7-evidencia-divergente", chain_path, i,
                     f"elo {i}: evidence_hash não confere com os 4 campos"))
                return
        if not rec.get("runtime_id"):
            violations.append(
                ("P0", "R7-sem-runtime-id", chain_path, i,
                 f"elo {i}: sem runtime_id (ADR-003)"))
            return
    if records[0].get("prev_hash") != "0" * 64:
        violations.append(("P0", "R7-genesis-adulterado", chain_path, 0,
                           "genesis com prev_hash inválido"))
        return
    recomputed_rash = records[-1]["record_hash"]
    try:
        with open(rash_path, encoding="utf-8") as f:
            committed = f.read().strip()
    except OSError as e:
        violations.append(("P0", "R7-rash-ausente", rash_path, 0,
                           f"task_rash não commitado: {e}"))
        return
    if committed != recomputed_rash:
        violations.append(
            ("P0", "R7-rash-divergente", rash_path, 0,
             "task_rash commitado != recomputado: a execução apresentada "
             "não é a execução que gerou a cadeia (resumo forjado ou "
             "passo removido)"))
        return


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--deliverables", default=None,
                    help="JSON {entregavel: [testes donos]} para R6")
    ap.add_argument("--chain", default=None,
                    help="cadeia de execução JSON para R7")
    ap.add_argument("--rash", default=None,
                    help="arquivo com o task_rash commitado para R7")
    args = ap.parse_args()

    violations = []
    for dirpath, dirnames, filenames in os.walk(args.root):
        dirnames[:] = [d for d in dirnames
                       if d not in ("node_modules", ".git", ".venv", "__pycache__", "dist")]
        for fn in filenames:
            if fn.endswith(CODE_EXT):
                scan_file(os.path.join(dirpath, fn), violations)

    if args.deliverables:
        check_deliverables(args.root, args.deliverables, violations)

    if args.chain or args.rash:
        if not (args.chain and args.rash):
            violations.append(
                ("P0", "R7-config-incompleta", "gate", 0,
                 "R7 exige --chain e --rash juntos"))
        else:
            check_task_rash(args.chain, args.rash, violations)

    p0 = [v for v in violations if v[0] == "P0"]
    # dedupe: mesma regra, mesmo arquivo, mesma linha = 1 violação
    seen = set()
    deduped = []
    for v in p0:
        key = (v[1], v[2], v[3])
        if key not in seen:
            seen.add(key)
            deduped.append(v)
    p0 = deduped
    if p0:
        print("DELIVERABLE TRUTH GATE: FAIL — violações P0:")
        for sev, rule, path, line, desc in p0:
            print(f"  [{sev}] {rule} {path}:{line} — {desc}")
        print(f"\nTotal: {len(p0)} violação(ões) P0. Merge bloqueado (ADR-004).")
        return 1
    print("DELIVERABLE TRUTH GATE: PASS — nenhuma simulação fora de quarentena, "
          "nenhum financeiro fictício, nenhum mock escape.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
