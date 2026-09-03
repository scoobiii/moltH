/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `GOS3 Multimodal Engine`
 * > fase: `Repositório Canônico de Instrumentos Jurídicos MEx & MoltH Hub` · data: `2026-09-02`
 * > assinatura: `Gemini · GOS3 Multimodal Engine · GOS3`
 */

export interface LegalContractTemplate {
  id: string
  code: string
  title: string
  category: 'Investimento' | 'Comercial' | 'Societário' | 'Regulatório' | 'Governança IA'
  targetAudience: string
  legalBasis: string
  summary: string
  clauses: { title: string; content: string }[]
}

export const ECOSYSTEM_LEGAL_DOCS: LegalContractTemplate[] = [
  {
    id: "mutuo-conversivel",
    code: "MEX-DOC-001",
    title: "Instrumento Particular de Mútuo Conversível em Participação Societária (SAFE Brasil)",
    category: "Investimento",
    targetAudience: "Investidores Anjo, Family Offices & Fundos Seed",
    legalBasis: "Art. 586 do Código Civil Brasileiro e Art. 61-A da LC 123/2006 (Marco Legal das Startups)",
    summary: "Regula o aporte de capital financeiro na MEx Energia com remuneração pré-fixada e opção exclusiva de conversão em quotas sociais ou ações preferenciais em rodada futura de investimento qualificado (Series A).",
    clauses: [
      {
        title: "Cláusula 1ª — Do Objeto e do Aporte",
        content: "O(A) MUTUANTE disponibiliza à MUTUÁRIA (MEx Energia / Consórcio GD) o montante acordado, destinado estritamente à aquisição de capacidade de baterias BESS e expansão de infraestrutura de geração distribuída, com depósito direto na conta da sociedade sob governança do H ROOT (Zeh Sobrinho)."
      },
      {
        title: "Cláusula 2ª — Da Remuneração e Atualização",
        content: "O valor principal do mútuo vencerá no prazo de 24 (vinte e quatro) meses, remunerado à taxa de CDI + 4,5% ao ano (ou remuneração participativa sobre a receita líquida de arbitragem tarifária BESS), com pagamentos mensais de juros todo dia 10."
      },
      {
        title: "Cláusula 3ª — Do Direito de Conversão em Quotas",
        content: "Na ocorrência de Evento de Liquidez ou Rodada Qualificada de Investimento (valuation mínimo de referência R$ 25.000.000,00), o MUTUANTE terá o direito potestativo de converter o saldo devedor em quotas sociais da MUTUÁRIA com desconto de 20% (vinte por cento) sobre o valuation da nova rodada."
      },
      {
        title: "Cláusula 4ª — Da Ausência de Responsabilidade Trabalhista ou Tributária",
        content: "Em estrita conformidade com o Art. 61-A da Lei Complementar nº 123/2006, o MUTUANTE não será considerado sócio da empresa antes da efetiva conversão, não respondendo por qualquer passivo operacional, cível, fiscal ou trabalhista da MUTUÁRIA."
      },
      {
        title: "Cláusula 5ª — Da Prova Criptográfica & Assinatura Digital",
        content: "As partes reconhecem expressamente a plena validade, higidez e eficácia probatória deste instrumento assinado eletronicamente via certificados digitais ou plataforma validada sob a MP 2.200-2/2001 e Art. 411 do CPC, tendo seu hash canônico registrado no log imutável do GOS3 Protocol."
      }
    ]
  },
  {
    id: "ppa-comercial",
    code: "MEX-DOC-002",
    title: "Contrato de Fornecimento e Compensação de Energia Limpa com Desconto Garantido (PPA B2B)",
    category: "Comercial",
    targetAudience: "Clientes Corporativos B2B (Comércio, Farmácias, Indústrias & Varejo)",
    legalBasis: "Lei Federal nº 14.300/2022 (Marco Legal da Micro e Minigeração Distribuída) e Resoluções Normativas ANEEL nº 1.000/2021 e nº 1.059/2023",
    summary: "Contrato de fornecimento de créditos de energia solar e biomassa pelo consórcio MEx Energia para clientes comerciais atendidos em baixa ou média tensão, assegurando economia de 15% a 25% na fatura de energia sem obras ou investimentos do cliente.",
    clauses: [
      {
        title: "Cláusula 1ª — Da Adesão ao Consórcio e Suprimento",
        content: "O CONSUMIDOR adere ao Consórcio MEx Energia para fins exclusivos de compensação de créditos de energia elétrica gerados pelas usinas do consórcio e injetados na rede da Distribuidora Local, nos termos do Sistema de Compensação de Energia Elétrica (SCEE)."
      },
      {
        title: "Cláusula 2ª — Do Desconto Garantido na Tarifa",
        content: "A MEx faturará mensalmente o consumo compensado com um desconto líquido garantido de 20% (vinte por cento) sobre a tarifa de energia homologada pela ANEEL aplicada pela Distribuidora local, gerando economia imediata ao CONSUMIDOR sem necessidade de qualquer instalação física no imóvel."
      },
      {
        title: "Cláusula 3ª — Da Fatura Única e Forma de Pagamento",
        content: "O faturamento será processado de forma unificada pelo @ErpAgent, disponibilizando ao CONSUMIDOR o boleto bancário com QR Code PIX dinâmico com vencimento no 5º dia útil após o fechamento da leitura pela concessionária."
      },
      {
        title: "Cláusula 4ª — Da Rescisão e Ausência de Fidelidade Abusiva",
        content: "O CONSUMIDOR poderá resilir o presente instrumento a qualquer momento mediante simples aviso prévio formal com antecedência de 60 (sessenta) dias, tempo estritamente necessário para o desvínculo regulatório perante a Distribuidora, sem cobrança de multas confiscatórias."
      }
    ]
  },
  {
    id: "acordo-socios",
    code: "MEX-DOC-003",
    title: "Acordo de Sócios, CapTable e Prerrogativas de Governança do H ROOT",
    category: "Societário",
    targetAudience: "Fundadores, Executivos & Sócios Quotistas da MEx Energia",
    legalBasis: "Art. 118 da Lei nº 6.404/1976 (aplicável supletivamente às sociedades limitadas) e Código Civil",
    summary: "Estatuto interno de governança que regulamenta a convivência societária, direitos de preferência, alienação de quotas, regras de Vesting dos agentes executivos e o poder absoluto de veto do H ROOT (Zeh Sobrinho).",
    clauses: [
      {
        title: "Cláusula 1ª — Da Autoridade Canônica do H ROOT",
        content: "Fica expressamente convencionado que o sócio fundador Zeh Sobrinho detém a qualidade inalienável de H ROOT (Identidade Raiz Soberana 427273fd). Nenhuma deliberação de aumento de capital, alteração estatutária, alienação de controle, endividamento superior a R$ 500.000,00 ou venda de ativos BESS terá eficácia sem o seu voto favorável expresso."
      },
      {
        title: "Cláusula 2ª — Do Direito de Venda Conjunta (Tag Along e Drag Along)",
        content: "Em caso de proposta de aquisição de controle por terceiros, os sócios minoritários terão direito de alienar suas quotas pelas mesmas condições financeiras (Tag Along 100%). Caso a oferta atinja valor mínimo de R$ 50.000.000,00 e seja aprovada pelo H ROOT, este poderá compelir os demais à venda conjunta (Drag Along)."
      },
      {
        title: "Cláusula 3ª — Da Não-Concorrência e Confidencialidade",
        content: "Todos os sócios e operadores comprometem-se a não desenvolver atividades concorrentes no segmento de comercialização varejista de energia e arbitragem BESS no território nacional durante o vínculo e pelo período de 24 (vinte e quatro) meses após eventual retirada."
      }
    ]
  },
  {
    id: "termo-consorcio-gd",
    code: "MEX-DOC-004",
    title: "Estatuto do Consórcio de Geração Compartilhada MEx Energia",
    category: "Regulatório",
    targetAudience: "Consorciados, Usinas Parceiras & Concessionárias de Energia",
    legalBasis: "Art. 28 da Lei Federal nº 14.300/2022 e Arts. 278 e 279 da Lei das S.A.",
    summary: "Instrumento de formalização do consórcio perante a Junta Comercial e concessionárias (Enel, Cemig, CPFL, Light, Neoenergia), disciplinando a titularidade das UC geradoras e rateio de créditos entre as UCs beneficiárias.",
    clauses: [
      {
        title: "Cláusula 1ª — Da Finalidade do Consórcio",
        content: "O Consórcio tem por finalidade precípua a união de pessoas jurídicas e físicas para aproveitamento comum e compensação dos créditos de energia elétrica gerados nas Usinas Fotovoltaicas e Sistemas BESS operados pela MEx Energia."
      },
      {
        title: "Cláusula 2ª — Da Liderança do Consórcio",
        content: "A MEx Energia atuará como Líder e Administradora do Consórcio, sendo a única interlocutora autorizada perante as Distribuidoras e órgãos reguladores para gerir as solicitações de alteração de percentuais de rateio e faturamento."
      },
      {
        title: "Cláusula 3ª — Da Autonomia Patrimonial das Partes",
        content: "O Consórcio não tem personalidade jurídica própria nem responde solidariamente pelas obrigações fiscais individuais de cada consorciado, preservando a estrita autonomia patrimonial e societária de cada integrante."
      }
    ]
  },
  {
    id: "politica-ia-seguranca",
    code: "MEX-DOC-005",
    title: "Termo de Governança dos Agentes de IA, Zero-Simulação & Kill Switch (ADR-002 / ADR-003)",
    category: "Governança IA",
    targetAudience: "Auditoria Externa (Big Four), Clientes, Desenvolvedores & Órgãos de Proteção de Dados",
    legalBasis: "Marco Legal da IA (PL 2338/2023), LGPD (Lei 13.709/2018) e Princípios GOS3 v1.0",
    summary: "Termo público e auditável de governança da IA no ecossistema MoltH/MEx, declarando que agentes autônomos operam sem personalização jurídica própria, com auditoria estrita anti-simulação via WebCrypto SHA-256 e botão de parada de emergência do operador humano.",
    clauses: [
      {
        title: "Cláusula 1ª — Da Subordinação Hierárquica Estrita",
        content: "Nenhum agente de Inteligência Artificial do ecossistema detém personalidade jurídica ou poder decisório autônomo sem supervisão. A hierarquia de comando é irrevogável: OWNER (H ROOT Zeh Sobrinho) > ADMIN > USER > AGENT."
      },
      {
        title: "Cláusula 2ª — Da Garantia Anti-Fabricação (Zero-Simulation ADR-002)",
        content: "Fica vedada a utilização de dados simulados ou alucinações não-declaradas. Toda ação de agente que envolva relatórios fiscais, auditoria ou comandos deve vir acompanhada do respectivo evidence_hash calculado em WebCrypto SHA-256 estrito e registrado no Cloud Firestore."
      },
      {
        title: "Cláusula 3ª — Do Kill Switch e Desconexão Imediata",
        content: "O Operador Humano Principal possui o direito e a capacidade técnica de acionar o Kill Switch a qualquer momento, interrompendo a execução de qualquer agente em menos de 100ms em caso de anomalia, sem prejuízo à integridade dos dados já assinados no Write-Ahead Log."
      },
      {
        title: "Cláusula 4ª — Da Conformidade LGPD e Proteção de Dados",
        content: "Todos os dados de faturas e de consumidores são submetidos a pré-anonimização antes do processamento por LLMs, vedado o envio de CPF, RG ou dados bancários desprotegidos para servidores externos."
      }
    ]
  }
]
