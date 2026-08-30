#!/usr/bin/env python3
"""Validate the sanitized MCP evidence produced by mcp_receipt_collector.py."""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any


def fail(message: str, code: int = 40) -> None:
    print(json.dumps({"status": "FAIL", "error": message}), file=sys.stderr)
    raise SystemExit(code)


def sha256_bytes(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def sha256_json(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return sha256_bytes(raw)


def read_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        fail(f"missing JSON file: {path}", 41)
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"invalid JSON in {path}: {exc}", 42)
    if not isinstance(value, dict):
        fail(f"JSON object expected: {path}", 43)
    return value


def required(obj: dict[str, Any], fields: tuple[str, ...], label: str) -> None:
    missing = [field for field in fields if not obj.get(field)]
    if missing:
        fail(f"{label} missing: {', '.join(missing)}", 44)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence-dir", type=Path, required=True)
    parser.add_argument("--agent-id", required=True)
    parser.add_argument("--runtime-id", required=True)
    parser.add_argument("--sandbox-id", required=True)
    parser.add_argument("--baseline-sha", required=True)
    parser.add_argument("--manifest-hash", required=True)
    parser.add_argument("--policy-hash", required=True)
    args = parser.parse_args()

    root = args.evidence_dir.resolve()
    index_path = root / "reports" / "collector-index.json"
    index = read_json(index_path)
    required(index, ("execution_id", "root_evidence_hash", "status"), "collector index")

    if index["status"] != "PASS":
        fail(f"collector status is not PASS: {index['status']}", 45)
    for field, expected in (
        ("agent_id", args.agent_id),
        ("runtime_id", args.runtime_id),
        ("sandbox_id", args.sandbox_id),
        ("baseline_sha", args.baseline_sha),
        ("manifest_hash", args.manifest_hash),
        ("policy_hash", args.policy_hash),
    ):
        if index.get(field) != expected:
            fail(f"index mismatch for {field}: {index.get(field)!r} != {expected!r}", 46)

    stored_root = index["root_evidence_hash"]
    copy = dict(index)
    copy.pop("root_evidence_hash", None)
    if sha256_json(copy) != stored_root:
        fail("root_evidence_hash is not reproducible", 47)

    event_path = root / "logs" / "mcp-events.jsonl"
    receipt_path = root / "receipts" / "receipts.jsonl"
    if not event_path.is_file():
        fail("missing MCP event log", 48)
    if not receipt_path.is_file():
        fail("missing receipt log", 49)

    requests: dict[str, dict[str, Any]] = {}
    events = 0
    accepted_receipts = 0
    response_without_receipt = 0

    for number, line in enumerate(event_path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError as exc:
            fail(f"invalid event JSON line {number}: {exc}", 50)
        required(event, ("execution_id", "sequence", "kind", "agent_id", "runtime_id", "sandbox_id", "baseline_sha", "event_hash"), "event")
        for field, expected in (
            ("agent_id", args.agent_id),
            ("runtime_id", args.runtime_id),
            ("sandbox_id", args.sandbox_id),
            ("baseline_sha", args.baseline_sha),
        ):
            if event[field] != expected:
                fail(f"event mismatch for {field} at line {number}", 51)
        event_copy = dict(event)
        stored_hash = event_copy.pop("event_hash")
        if sha256_json(event_copy) != stored_hash:
            fail(f"invalid event_hash at line {number}", 52)

        payload = event.get("payload")
        if not isinstance(payload, dict):
            fail(f"event payload is not an object at line {number}", 53)
        kind = event["kind"]
        if kind == "request":
            message_id = payload.get("id")
            if message_id is not None:
                requests[str(message_id)] = payload
        elif kind == "receipt-accepted":
            accepted_receipts += 1
        elif kind == "response-without-receipt":
            response_without_receipt += 1
        events += 1

    receipts = []
    for number, line in enumerate(receipt_path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            receipt = json.loads(line)
        except json.JSONDecodeError as exc:
            fail(f"invalid receipt JSON line {number}: {exc}", 54)
        required(receipt, ("receipt_id", "request_id", "effect", "result_hash", "timestamp", "receipt_hash"), "receipt")
        copy = dict(receipt)
        stored_hash = copy.pop("receipt_hash")
        if sha256_json(copy) != stored_hash:
            fail(f"invalid receipt_hash at line {number}", 55)
        for field, expected in (
            ("agent_id", args.agent_id),
            ("runtime_id", args.runtime_id),
            ("sandbox_id", args.sandbox_id),
        ):
            if receipt.get(field) != expected:
                fail(f"receipt mismatch for {field} at line {number}", 56)
        if str(receipt["request_id"]) not in requests:
            fail(f"receipt references unknown request_id at line {number}", 57)
        if receipt["effect"] == "committed" and not receipt.get("approval_id"):
            fail(f"committed receipt lacks approval_id at line {number}", 58)
        receipts.append(receipt)

    if accepted_receipts != len(receipts):
        fail(f"receipt count mismatch: events={accepted_receipts}, file={len(receipts)}", 59)

    report = {
        "status": "PASS",
        "agent_id": args.agent_id,
        "runtime_id": args.runtime_id,
        "sandbox_id": args.sandbox_id,
        "baseline_sha": args.baseline_sha,
        "events": events,
        "requests": len(requests),
        "receipts": len(receipts),
        "responses_without_receipt": response_without_receipt,
        "side_effects_committed": sum(r["effect"] == "committed" for r in receipts),
        "note": "responses without explicit receipts are not treated as side effects",
    }
    report["validation_hash"] = sha256_json(report)
    output = root / "reports" / "validation.json"
    output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
