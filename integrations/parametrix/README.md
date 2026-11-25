# MoltH × ParametrIX

Este adaptador permite que um agente MoltH/OpenClaw/Qwen use o ParametrIX como servidor MCP. Ele aceita apenas ferramentas allowlisted, encaminha JSON-RPC para `/api/mcp` e retorna `executed: false` quando o endpoint está offline ou a ferramenta não está autorizada.

```bash
PARAMETRIX_URL=http://127.0.0.1:3000 \
python3 integrations/parametrix/parametrix_mcp.py --list

python3 integrations/parametrix/parametrix_mcp.py \
  cad_get_scoobiii_vuc_proof '{}'
```

A integração é real somente quando o servidor ParametrIX estiver ativo e a resposta MCP retornar resultado. O adapter não executa shell originado do prompt e não fabrica prova VUC.
