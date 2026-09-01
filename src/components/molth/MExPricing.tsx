import React from 'react';
export default function MExPricing({orgId='mex-427273fd'}:{orgId?:string}){
  const agents=['BiAgent-mex','FinanceAgent-mex','ErpAgent-mex','CommercialAgent-mex','SupportAgent-mex','CrmAgent-mex'];
  return (
    <div className="p-6 bg-[#0a0a0a] text-white font-mono border-2 border-cyan-400 rounded">
      <h1 className="text-2xl text-cyan-400">MExPricing - 6 carteiras R$4k x6=R$24k MOST POPULAR org {orgId} - H ROOT 427273fd - GO 88/100</h1>
      <div className="grid md:grid-cols-3 gap-3 mt-4 text-[10px]">{agents.map(a=><div key={a} className="border p-2">{a} wallet {orgId}:{a.split('-')[0]} CNPJ PIX {a}@molth evidence_hash sha256:{a}:427273fd WAL400</div>)}</div>
      <div className="mt-3">Fluxo: Encaminhado&gt;Analisado&gt;Proposta&gt;Comprado&gt;Instalado&gt;Testado&gt;Suporte&gt;Monitoramento&gt;Start PO @</div>
    </div>
  )
}
