#!/usr/bin/env python3
"""MoltH -> Parametrix MCP bridge using only the Python standard library."""
import json
import os
import sys
import urllib.error
import urllib.request

URL = os.environ.get('PARAMETRIX_URL', 'http://127.0.0.1:3000').rstrip('/') + '/api/mcp'
TOKEN = os.environ.get('MCP_TOKEN', '')
ALLOWLIST = {
    'cad_get_scoobiii_vuc_proof',
    'cad_run_structural_fea',
    'cad_evaluate_nurbs_metrics',
    'cad_optimize_surface_curvature',
}


def request(payload: dict) -> dict:
    headers = {'Content-Type': 'application/json'}
    if TOKEN:
        headers['Authorization'] = f'Bearer {TOKEN}'
    req = urllib.request.Request(URL, data=json.dumps(payload).encode(), headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode())


def call_tool(name: str, arguments: dict | None = None) -> dict:
    if name not in ALLOWLIST:
        return {'executed': False, 'claim': 'not_executed', 'reason': f'tool not allowlisted: {name}'}
    result = request({'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call', 'params': {'name': name, 'arguments': arguments or {}}})
    return {'executed': 'error' not in result, 'claim': 'executed' if 'error' not in result else 'not_executed', 'result': result}


def main() -> int:
    if len(sys.argv) < 2 or sys.argv[1] == '--list':
        print(json.dumps({'adapter': 'moltH-parametrix', 'url': URL, 'tools': sorted(ALLOWLIST)}))
        return 0
    try:
        print(json.dumps(call_tool(sys.argv[1], json.loads(sys.argv[2]) if len(sys.argv) > 2 else {})))
        return 0
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        print(json.dumps({'executed': False, 'claim': 'not_executed', 'reason': str(exc)}))
        return 1


if __name__ == '__main__':
    sys.exit(main())
