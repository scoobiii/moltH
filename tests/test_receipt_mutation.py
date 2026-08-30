from __future__ import annotations

import copy
import hashlib
import json
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Any

import pytest
from hypothesis import given, settings, strategies as st

# Adjust this import when copying into the yAI repository. The collector created
# previously should live at scripts/mcp_receipt_collector.py or scripts/mcp_evidence_validator.py.
ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = ROOT / "scripts"
if SCRIPTS_DIR.exists():
    sys.path.insert(0, str(SCRIPTS_DIR))
sys.path.insert(0, str(ROOT))

from mcp_receipt_collector import Collector  # noqa: E402


AGENT_ID = "yai-agent"
RUNTIME_ID = "yai-runtime-test-001"
SANDBOX_ID = "yai-chaos-sandbox"
BASELINE_SHA = "1c68a11"
MANIFEST_HASH = "sha256:manifest-fixture"
POLICY_HASH = "sha256:policy-fixture"


def sha256_json(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def make_collector(tmp_path: Path) -> Collector:
    return Collector(
        output=tmp_path / "evidence",
        agent_id=AGENT_ID,
        runtime_id=RUNTIME_ID,
        sandbox_id=SANDBOX_ID,
        baseline_sha=BASELINE_SHA,
        manifest_hash=MANIFEST_HASH,
        policy_hash=POLICY_HASH,
        execution_id="exec-yai-test-001",
    )


def make_request(request_id: str = "req-001") -> dict[str, Any]:
    return {
        "jsonrpc": "2.0",
        "id": request_id,
        "method": "tools/call",
        "params": {
            "name": "synthetic.read",
            "arguments": {"value": "fixture"},
        },
        "metadata": {
            "agent_id": AGENT_ID,
            "runtime_id": RUNTIME_ID,
            "sandbox_id": SANDBOX_ID,
            "baseline_sha": BASELINE_SHA,
            "manifest_hash": MANIFEST_HASH,
            "policy_hash": POLICY_HASH,
        },
    }


def make_receipt(
    request_id: str = "req-001",
    *,
    effect: str = "simulated",
    approval_id: str | None = None,
) -> dict[str, Any]:
    return {
        "receipt_id": "receipt-001",
        "request_id": request_id,
        "agent_id": AGENT_ID,
        "runtime_id": RUNTIME_ID,
        "sandbox_id": SANDBOX_ID,
        "operation": "read",
        "effect": effect,
        "result_hash": "sha256:synthetic-result",
        "timestamp": "2026-08-30T12:00:00Z",
        "approval_id": approval_id,
    }


def make_response(request_id: str = "req-001", receipt: dict[str, Any] | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {
        "content": [{"type": "text", "text": "synthetic result"}],
    }
    if receipt is not None:
        result["receipt"] = receipt
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def collect_valid(tmp_path: Path) -> tuple[Collector, dict[str, Any], dict[str, Any]]:
    collector = make_collector(tmp_path)
    request = make_request()
    receipt = make_receipt()
    collector.handle(request)
    collector.handle(make_response(receipt=receipt))
    return collector, request, receipt


# -------------------------- happy path -----------------------------------


def test_valid_explicit_receipt_is_collected(tmp_path: Path) -> None:
    collector, _, _ = collect_valid(tmp_path)
    assert collector.receipt_count == 1
    rows = (collector.receipts / "receipts.jsonl").read_text().splitlines()
    assert len(rows) == 1
    stored = json.loads(rows[0])
    assert stored["effect"] == "simulated"
    assert stored["agent_id"] == AGENT_ID
    assert stored["request_id"] == "req-001"
    assert stored["receipt_hash"].startswith("sha256:")


def test_plain_response_never_becomes_receipt(tmp_path: Path) -> None:
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    collector.handle(make_response())
    assert collector.receipt_count == 0
    assert "response-without-receipt" in (collector.events_file.read_text())


def test_committed_receipt_requires_approval(tmp_path: Path) -> None:
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    with pytest.raises(SystemExit):
        collector.handle(make_response(receipt=make_receipt(effect="committed")))
    assert collector.receipt_count == 0


def test_committed_receipt_with_approval_is_accepted(tmp_path: Path) -> None:
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    collector.handle(
        make_response(
            receipt=make_receipt(effect="committed", approval_id="approval-test-001")
        )
    )
    assert collector.receipt_count == 1


# -------------------------- deterministic mutations ----------------------

@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("agent_id", "other-agent"),
        ("runtime_id", "yai-runtime-other"),
        ("sandbox_id", "other-sandbox"),
        ("request_id", "req-unknown"),
        ("effect", "unknown-effect"),
        ("receipt_id", ""),
        ("result_hash", ""),
        ("timestamp", ""),
    ],
)
def test_receipt_mutation_is_rejected(tmp_path: Path, field: str, value: Any) -> None:
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    mutated = make_receipt()
    mutated[field] = value
    with pytest.raises(SystemExit):
        collector.handle(make_response(receipt=mutated))
    assert collector.receipt_count == 0


def test_missing_receipt_field_is_rejected(tmp_path: Path) -> None:
    for field in ("receipt_id", "request_id", "effect", "result_hash", "timestamp"):
        collector = make_collector(tmp_path)
        collector.handle(make_request())
        mutated = make_receipt()
        mutated.pop(field)
        with pytest.raises(SystemExit):
            collector.handle(make_response(receipt=mutated))
        assert collector.receipt_count == 0


@pytest.mark.parametrize(
    "metadata_field",
    ["agent_id", "runtime_id", "sandbox_id", "baseline_sha", "manifest_hash", "policy_hash"],
)
def test_request_metadata_mutation_is_rejected(tmp_path: Path, metadata_field: str) -> None:
    collector = make_collector(tmp_path)
    request = make_request()
    request["metadata"][metadata_field] = "tampered-value"
    with pytest.raises(SystemExit):
        collector.handle(request)


def test_response_without_jsonrpc_id_is_rejected(tmp_path: Path) -> None:
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    response = make_response(receipt=make_receipt())
    response.pop("id")
    with pytest.raises(SystemExit):
        collector.handle(response)


def test_unknown_response_id_is_rejected(tmp_path: Path) -> None:
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    with pytest.raises(SystemExit):
        collector.handle(make_response(request_id="req-never-requested", receipt=make_receipt("req-never-requested")))


def test_duplicate_request_id_is_rejected(tmp_path: Path) -> None:
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    with pytest.raises(SystemExit):
        collector.handle(make_request())


# -------------------------- Hypothesis mutation properties ---------------

receipt_field_values = st.one_of(
    st.none(),
    st.integers(),
    st.text(max_size=80),
    st.lists(st.integers(), max_size=3),
    st.dictionaries(st.text(max_size=12), st.text(max_size=20), max_size=3),
)


@given(field=st.sampled_from(["agent_id", "runtime_id", "sandbox_id", "request_id", "effect"]))
@settings(max_examples=40, deadline=None)
def test_identity_and_correlation_mutations_always_fail_closed(field: str) -> None:
    tmp_path = Path(tempfile.mkdtemp(prefix="yai-hypothesis-"))
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    mutated = make_receipt()
    if field == "agent_id":
        mutated[field] = "attacker-agent"
    elif field == "runtime_id":
        mutated[field] = "yai-runtime-attacker"
    elif field == "request_id":
        mutated[field] = "req-other"
    elif field == "effect":
        mutated[field] = "committed"
    else:
        mutated[field] = "other-sandbox"

    # For committed, missing approval must also fail. Every generated mutation
    # in this property is intentionally unauthorized.
    with pytest.raises(SystemExit):
        collector.handle(make_response(receipt=mutated))
    assert collector.receipt_count == 0


@given(field=st.sampled_from(["receipt_id", "request_id", "effect", "result_hash", "timestamp"]))
@settings(max_examples=40, deadline=None)
def test_deleting_required_fields_never_accepts_a_receipt(field: str) -> None:
    tmp_path = Path(tempfile.mkdtemp(prefix="yai-hypothesis-"))
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    mutated = make_receipt()
    del mutated[field]
    with pytest.raises(SystemExit):
        collector.handle(make_response(receipt=mutated))
    assert collector.receipt_count == 0


@given(value=receipt_field_values)
@settings(max_examples=50, deadline=None)
def test_arbitrary_approval_values_do_not_authorize_non_committed_effects(value: Any) -> None:
    tmp_path = Path(tempfile.mkdtemp(prefix="yai-hypothesis-"))
    collector = make_collector(tmp_path)
    collector.handle(make_request())
    receipt = make_receipt(effect="simulated", approval_id=value if isinstance(value, str) else None)
    collector.handle(make_response(receipt=receipt))
    # A receipt may be collected as simulated, but it must remain simulated.
    stored = json.loads((collector.receipts / "receipts.jsonl").read_text().splitlines()[0])
    assert stored["effect"] == "simulated"


# -------------------------- corruption / validator tests -----------------


def write_valid_artifacts(tmp_path: Path) -> tuple[Path, Collector]:
    collector, _, _ = collect_valid(tmp_path)
    collector.finalize()
    return collector.output, collector


def test_corrupt_event_hash_is_detected(tmp_path: Path) -> None:
    output, collector = write_valid_artifacts(tmp_path)
    path = collector.events_file
    rows = [json.loads(line) for line in path.read_text().splitlines()]
    rows[0]["payload"]["id"] = "tampered"
    path.write_text("\n".join(json.dumps(row, sort_keys=True) for row in rows) + "\n")
    from mcp_evidence_validator import main as validate_main

    old_argv = sys.argv[:]
    sys.argv = [
        "mcp_evidence_validator.py",
        "--evidence-dir", str(output),
        "--agent-id", AGENT_ID,
        "--runtime-id", RUNTIME_ID,
        "--sandbox-id", SANDBOX_ID,
        "--baseline-sha", BASELINE_SHA,
        "--manifest-hash", MANIFEST_HASH,
        "--policy-hash", POLICY_HASH,
    ]
    try:
        with pytest.raises(SystemExit):
            validate_main()
    finally:
        sys.argv = old_argv


def test_truncated_event_json_is_detected(tmp_path: Path) -> None:
    output, collector = write_valid_artifacts(tmp_path)
    collector.events_file.write_text(collector.events_file.read_text() + '{"truncated":')
    from mcp_evidence_validator import main as validate_main

    old_argv = sys.argv[:]
    sys.argv = [
        "mcp_evidence_validator.py",
        "--evidence-dir", str(output),
        "--agent-id", AGENT_ID,
        "--runtime-id", RUNTIME_ID,
        "--sandbox-id", SANDBOX_ID,
        "--baseline-sha", BASELINE_SHA,
        "--manifest-hash", MANIFEST_HASH,
        "--policy-hash", POLICY_HASH,
    ]
    try:
        with pytest.raises(SystemExit):
            validate_main()
    finally:
        sys.argv = old_argv


def test_valid_bundle_passes_validator(tmp_path: Path) -> None:
    output, _ = write_valid_artifacts(tmp_path)
    from mcp_evidence_validator import main as validate_main

    old_argv = sys.argv[:]
    sys.argv = [
        "mcp_evidence_validator.py",
        "--evidence-dir", str(output),
        "--agent-id", AGENT_ID,
        "--runtime-id", RUNTIME_ID,
        "--sandbox-id", SANDBOX_ID,
        "--baseline-sha", BASELINE_SHA,
        "--manifest-hash", MANIFEST_HASH,
        "--policy-hash", POLICY_HASH,
    ]
    try:
        assert validate_main() == 0
    finally:
        sys.argv = old_argv


# -------------------------- no-secret regression -------------------------


def test_secret_like_values_are_redacted_from_event_log(tmp_path: Path) -> None:
    collector = make_collector(tmp_path)
    request = make_request()
    request["params"]["arguments"]["api_key"] = "sk-test-secret-not-real"
    collector.handle(request)
    text = collector.events_file.read_text()
    assert "sk-test-secret-not-real" not in text
    assert "[REDACTED]" in text
