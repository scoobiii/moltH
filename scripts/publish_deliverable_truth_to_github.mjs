/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Sincronização de Main & CI Gate Publication` (ver docs/team.md)
 * > fase: `Merge Gate Aprovado — ADR-004 & ADR-006` · data: `2026-09-06` · hora: `13:05:00 UTC`
 * > antes: Branch main remota com dangling import em cryptoPolicy.ts e sem ADR-006 / deliverableTruthGate
 * > depois: Publicação atômica em main aprovada pelo operador com exclusão de cryptoPolicy e inclusão do gate
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import { readFileSync } from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'scoobiii';
const REPO = 'moltH';
const BRANCH = 'main';

if (!TOKEN) {
  console.error('[GOS3-FATAL] GITHUB_TOKEN não configurado no ambiente.');
  process.exit(1);
}

const headers = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'GOS3-ProtocolEngine'
};

async function gh(path, options = {}) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${options.method || 'GET'} ${path} falhou [${res.status}]: ${body}`);
  }
  return res.json();
}

async function publish() {
  console.log(`[GOS3] 1. Obtendo referência atual de ${BRANCH}...`);
  const ref = await gh(`/git/refs/heads/${BRANCH}`);
  const latestCommitSha = ref.object.sha;
  console.log(`[GOS3] Commit atual em ${BRANCH}: ${latestCommitSha}`);

  console.log(`[GOS3] 2. Obtendo commit base...`);
  const baseCommit = await gh(`/git/commits/${latestCommitSha}`);
  const baseTreeSha = baseCommit.tree.sha;

  console.log(`[GOS3] 3. Preparando árvore atômica (ADR-004 / ADR-006)...`);
  const filesToUpload = [
    { path: 'src/lib/deliverableTruthGate.ts', local: 'src/lib/deliverableTruthGate.ts' },
    { path: 'tests/audit/deliverable_truth_gate.test.ts', local: 'tests/audit/deliverable_truth_gate.test.ts' },
    { path: 'tests/audit/sovereign.test.ts', local: 'tests/audit/sovereign.test.ts' },
    { path: 'docs/ADR-006-DELIVERABLE-TRUTH-GATE.md', local: 'docs/ADR-006-DELIVERABLE-TRUTH-GATE.md' },
    { path: 'docs/decisions.md', local: 'docs/decisions.md' },
    { path: 'docs/ADR-004-BRANCH-PROTECTION-CI-GATE.md', local: 'docs/ADR-004-BRANCH-PROTECTION-CI-GATE.md' },
    { path: 'docs/PLAYBOOK.md', local: 'docs/PLAYBOOK.md' },
    { path: 'docs/GIT-POLICY.md', local: 'docs/GIT-POLICY.md' },
    { path: 'docs/PRODUCT-TRUTH.md', local: 'docs/PRODUCT-TRUTH.md' },
    { path: 'docs/incidents.md', local: 'docs/incidents.md' },
    { path: 'docs/README.md', local: 'docs/README.md' }
  ];

  const tree = [];

  for (const f of filesToUpload) {
    const content = readFileSync(f.local, 'utf8');
    tree.push({
      path: f.path,
      mode: '100644',
      type: 'blob',
      content
    });
  }

  // Deleta o arquivo zumbi que importava o sovereignVault deletado no commit 0581f73
  tree.push({
    path: 'src/server/security/cryptoPolicy.ts',
    mode: '100644',
    type: 'blob',
    sha: null
  });

  console.log(`[GOS3] 4. Criando árvore git com ${tree.length} operações...`);
  const newTree = await gh('/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree
    })
  });
  console.log(`[GOS3] Árvore criada: ${newTree.sha}`);

  const commitMessage = `feat(security): ADR-006 DELIVERABLE-TRUTH GATE, P0 Domains (DREX/PIX) & Regra 7

- Promulga ADR-006 vinculante com fluxo impeditivo para Main
- Fixa domínios P0: wallet, pix, drex, financial, banking, payment, settlement, balance, account, secret, credential
- Implementa distinção formal TEST FIXTURE / MOCK != PRODUCTION IMPLEMENTATION
- Implementa Regra 7: proibição de declarar PASS com deliverable bloqueado
- Aplica protocolo sovereignVault: Mexeu -> Achou Erro -> Conserta (CORRECTION REQUIRED)
- Remove src/server/security/cryptoPolicy.ts (código zumbi)
- Adiciona src/lib/deliverableTruthGate.ts e tests/audit/deliverable_truth_gate.test.ts (64/64 PASS)
- Atualiza decisions.md, ADR-004, PLAYBOOK, GIT-POLICY, PRODUCT-TRUTH, README e INC-003
- Aprovado pelo operador humano (sobrinhoSJ@gmail.com) sob governança GOS3 v1.5`;

  console.log(`[GOS3] 5. Criando commit com assinatura de governança...`);
  const newCommit = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message: commitMessage,
      tree: newTree.sha,
      parents: [latestCommitSha]
    })
  });
  console.log(`[GOS3] Commit criado: ${newCommit.sha}`);

  console.log(`[GOS3] 6. Atualizando ref de ${BRANCH} para ${newCommit.sha}...`);
  const updatedRef = await gh(`/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommit.sha,
      force: false
    })
  });

  console.log(`[GOS3] SUCESSO! Ref atualizado: ${updatedRef.ref} -> ${updatedRef.object.sha}`);
  console.log(`[GOS3] Commit URL: https://github.com/${OWNER}/${REPO}/commit/${newCommit.sha}`);
}

publish().catch(err => {
  console.error('[GOS3-FATAL] Falha na publicação:', err);
  process.exit(1);
});
