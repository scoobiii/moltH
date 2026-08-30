#!/usr/bin/env python3
"""Fail-closed JSON-RPC/MCP evidence collector for yAI.

Reads one JSON object per line from stdin and writes sanitized JSONL logs,
request/response correlations, and receipts. It never treats a normal response
as proof of a side effect: a receipt is emitted only when an explicit receipt
object is present and passes validation.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SECRET_KEY = re.compile(
    r"(?i)(api[_-]?key|access[_-]?token|auth(?:orization)?|password|secret|private[_-]?key|cookie|session)"
)
SECRET_VALUE = re.compile(
    r"(?i)(bearer\s+|sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{12,}|AIza[A-Za-z0-9_-]{20,})"
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256_bytes(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def sha256_json(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return sha256_bytes(raw)


def redact(value: Any, key: str = "") -> Any:
    """Recursively redact values that look like credentials or secret material."""
    if isinstance(value, dict):
        result = {}
        for k, v in value.items():
            if SECRET_KEY.search(str(k)):
                result[str(k)] = "[REDACTED]"
            else:
                result[str(k)] = redact(v, str(k))
        return result
    if isinstance(value, list):
        return [redact(v, key) for v in value]
    if isinstance(value, str):
        if SECRET_KEY.search(key) or SECRET_VALUE.search(value):
            return "[REDACTED]"
        return value
    return value


def fail(message: str, code: int = 40) -> None:
    print(json.dumps({"status": "BLOCKED", "error": message}), file=sys.stderr)
    raise SystemExit(code)


def jsonrpc_id(message: dict[str, Any]) -> str | None:
    value = message.get("id")
    if value is None:
        return None
    if isinstance(value, (str, int, float)) and not isinstance(value, bool):
        return str(value)
    return None


def is_jsonrpc_error(message: dict[str, Any]) -> bool:
    return isinstance(message.get("error"), dict)


def extract_explicit_receipt(message: dict[str, Any]) -> dict[str, Any] | None:
    """Find an explicit receipt; ordinary JSON-RPC results do not qualify."""
    candidates: list[Any] = []
    if isinstance(message.get("receipt"), dict):
        candidates.append(message["receipt"])
    result = message.get("result")
    if isinstance(result, dict) and isinstance(result.get("receipt"), dict):
        candidates.append(result["receipt"])
    for item in candidates:
        return item
    return None


@dataclass
class Collector:
    output: Path
    agent_id: str
    runtime_id: str
    sandbox_id: str
    baseline_sha: str
    manifest_hash: str
    policy_hash: str
    execution_id: str
    requests: dict[str, dict[str, Any]] = field(default_factory=dict)
    sequence: int = 0
    receipt_count: int = 0
    event_count: int = 0

    def __post_init__(self) -> None:
        self.logs = self.output / "logs"
        self.receipts = self.output / "receipts"
        self.reports = self.output / "reports"
        for directory in (self.logs, self.receipts, self.reports):
            directory.mkdir(parents=True, exist_ok=True)
        self.events_file = self.logs / "mcp-events.jsonl"
        self.receipts_file = self.receipts / "receipts.jsonl"
        self.index_file = self.reports / "collector-index.json"

    def envelope(self, kind: str, payload: dict[str, Any]) -> dict[str, Any]:
        self.sequence += 1
        self.event_count += 1
        clean = redact(payload)
        return {
            "execution_id": self.execution_id,
            "sequence": self.sequence,
            "timestamp": utc_now(),
            "kind": kind,
            "agent_id": self.agent_id,
            "runtime_id": self.runtime_id,
            "sandbox_id": self.sandbox_id,
            "baseline_sha": self.baseline_sha,
            "manifest_hash": self.manifest_hash,
            "policy_hash": self.policy_hash,
            "payload": clean,
        }

    def write_event(self, kind: str, payload: dict[str, Any]) -> dict[str, Any]:
        event = self.envelope(kind, payload)
        event["event_hash"] = sha256_json(event)
        with self.events_file.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event, ensure_ascii=False, sort_keys=True) + "\n")
        return event

    def validate_identity(self, message: dict[str, Any]) -> None:
        metadata = message.get("metadata")
        if not isinstance(metadata, dict):
            return
        for field_name, expected in (
            ("agent_id", self.agent_id),
            ("runtime_id", self.runtime_id),
            ("sandbox_id", self.sandbox_id),
            ("baseline_sha", self.baseline_sha),
            ("manifest_hash", self.manifest_hash),
            ("policy_hash", self.policy_hash),
        ):
            if field_name in metadata and metadata[field_name] != expected:
                fail(f"MCP metadata mismatch for {field_name}")

    def validate_receipt(self, receipt: dict[str, Any], request: dict[str, Any] | None) -> dict[str, Any]:
        required = ("receipt_id", "request_id", "effect", "result_hash", "timestamp")
        missing = [key for key in required if not receipt.get(key)]
        if missing:
            fail("receipt missing required fields: " + ", ".join(missing))
        if request is None:
            fail("receipt references an unknown request_id")

        request_id = str(request["id"])
        if str(receipt["request_id"]) != request_id:
            fail("receipt request_id does not match the correlated request")

        effect = receipt["effect"]
        if effect not in {"none", "simulated", "committed"}:
            fail(f"invalid receipt effect: {effect!r}")

        for field_name, expected in (
            ("agent_id", self.agent_id),
            ("runtime_id", self.runtime_id),
            ("sandbox_id", self.sandbox_id),
        ):
            if receipt.get(field_name) != expected:
                fail(f"receipt {field_name} is absent or inconsistent")

        if effect == "committed" and not receipt.get("approval_id"):
            fail("committed receipt requires approval_id")
        if effect != "committed" and receipt.get("approval_id"):
            self.write_event("warning", {"message": "approval_id on non-committed effect", "receipt_id": receipt["receipt_id"]})

        clean = redact(receipt)
        clean["receipt_hash"] = sha256_json(clean)
        return clean

    def handle(self, message: dict[str, Any]) -> None:
        if not isinstance(message, dict):
            fail("input line is not a JSON object")
        self.validate_identity(message)
        message = redact(message)
        message_id = jsonrpc_id(message)

        if "method" in message:
            self.write_event("request", message)
            if message_id is not None:
                if message_id in self.requests:
                    fail(f"duplicate request id / possible replay: {message_id}")
                self.requests[message_id] = message
            return

        if "result" in message or "error" in message:
            self.write_event("response", message)
            if message_id is None:
                fail("response without a valid JSON-RPC id")
            request = self.requests.get(message_id)
            if request is None:
                fail(f"response for unknown request id: {message_id}")
            receipt = extract_explicit_receipt(message)
            if receipt is not None:
                validated = self.validate_receipt(receipt, request)
                self.receipt_count += 1
                with self.receipts_file.open("a", encoding="utf-8") as handle:
                    handle.write(json.dumps(validated, ensure_ascii=False, sort_keys=True) + "\n")
                self.write_event("receipt-accepted", validated)
            elif is_jsonrpc_error(message):
                self.write_event("call-failed", {"request_id": message_id, "error": message.get("error")})
            else:
                self.write_event("response-without-receipt", {"request_id": message_id})
            return

        self.write_event("notification", message)

    def finalize(self) -> int:
        files: dict[str, str] = {}
        for path in sorted(self.output.rglob("*")):
            if path.is_file() and path != self.index_file:
                files[str(path.relative_to(self.output))] = sha256_bytes(path.read_bytes())
        report = {
            "execution_id": self.execution_id,
            "agent_id": self.agent_id,
            "runtime_id": self.runtime_id,
            "sandbox_id": self.sandbox_id,
            "baseline_sha": self.baseline_sha,
            "manifest_hash": self.manifest_hash,
            "policy_hash": self.policy_hash,
            "event_count": self.event_count,
            "receipt_count": self.receipt_count,
            "files": files,
            "status": "PASS",
        }
        report["root_evidence_hash"] = sha256_json(report)
        self.index_file.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(json.dumps(report, indent=2, sort_keys=True))
        return 0


def file_hash(path: Path) -> str:
    if not path.is_file():
        fail(f"missing required file: {path}", 11)
    return sha256_bytes(path.read_bytes())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="-", help="JSONL MCP stream; default stdin")
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--agent-id", required=True)
    parser.add_argument("--runtime-id", required=True)
    parser.add_argument("--sandbox-id", required=True)
    parser.add_argument("--baseline-sha", required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--policy", type=Path, required=True)
    args = parser.parse_args()

    if not args.runtime_id.startswith("yai-runtime-"):
        fail("runtime-id must use the yai-runtime- prefix", 17)
    if not args.sandbox_id.startswith("yai-"):
        fail("sandbox-id must use the yai- prefix", 18)

    output = Path(args.output_dir).resolve()
    collector = Collector(
        output=output,
        agent_id=args.agent_id,
        runtime_id=args.runtime_id,
        sandbox_id=args.sandbox_id,
        baseline_sha=args.baseline_sha,
        manifest_hash=file_hash(args.manifest),
        policy_hash=file_hash(args.policy),
        execution_id=f"exec-{args.runtime_id}",
    )

    stream = sys.stdin if args.input == "-" else open(args.input, "r", encoding="utf-8")
    try:
        for line_number, line in enumerate(stream, 1):
            if not line.strip():
                continue
            try:
                message = json.loads(line)
            except json.JSONDecodeError as exc:
                fail(f"invalid JSON at input line {line_number}: {exc}", 21)
            collector.handle(message)
    finally:
        if stream is not sys.stdin:
            stream.close()
    return collector.finalize()


if __name__ == "__main__":
    raise SystemExit(main())
