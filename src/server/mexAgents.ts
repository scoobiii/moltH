import { createHash } from 'node:crypto';

export const MEX_H_ROOT = "635cfa77";
export const MEX_RUNTIME = "427273fd2bdb12e608222856fd248a4a07d25599a74a6fbe318908a14493f2da";
export const MEX_OWNER = "86fb17ab5311bb40";
export const MEX_ID = "mex-427273fd";

function computeAgentHash(handle: string): string {
  return createHash('sha256').update(`${handle}:${MEX_RUNTIME}`).digest('hex');
}

export const mexTwins = [
  {id:"twin-mex-001", name:"Isabela Moreira", handle:"Isabela_Moreira", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Isabela_Moreira")},
  {id:"twin-mex-002", name:"Joao Almeida", handle:"Joao_Almeida", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Joao_Almeida")},
  {id:"twin-mex-003", name:"Amanda Souza", handle:"Amanda_Souza", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Amanda_Souza")},
  {id:"twin-mex-004", name:"Marcos Paulo", handle:"Marcos_Paulo", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Marcos_Paulo")},
  {id:"twin-mex-005", name:"Joao Batista", handle:"Joao_Batista", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Joao_Batista")},
  {id:"twin-mex-006", name:"Maria Oliveira", handle:"Maria_Oliveira", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Maria_Oliveira")},
  {id:"twin-mex-007", name:"Felipe Alves", handle:"Felipe_Alves", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Felipe_Alves")},
  {id:"twin-mex-008", name:"Fernanda Souza", handle:"Fernanda_Souza", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Fernanda_Souza")},
  {id:"twin-mex-009", name:"Gabriela Santos", handle:"Gabriela_Santos", role:"BiAgent-mex", wallet:"R80", dept:"BiAgent", sha: computeAgentHash("Gabriela_Santos")},
  {id:"twin-mex-010", name:"Ana Rodrigues", handle:"Ana_Rodrigues", role:"Finance-mex", wallet:"R80", dept:"Finance", sha: computeAgentHash("Ana_Rodrigues")},
  {id:"twin-mex-011", name:"Ricardo Ferreira", handle:"Ricardo_Ferreira", role:"Finance-mex", wallet:"R80", dept:"Finance", sha: computeAgentHash("Ricardo_Ferreira")},
  {id:"twin-mex-012", name:"Alice Santos", handle:"Alice_Santos", role:"Finance-mex", wallet:"R80", dept:"Finance", sha: computeAgentHash("Alice_Santos")},
  {id:"twin-mex-013", name:"Bruno Silva", handle:"Bruno_Silva", role:"Finance-mex", wallet:"R80", dept:"Finance", sha: computeAgentHash("Bruno_Silva")},
  {id:"twin-mex-014", name:"Daniela Rodrigues", handle:"Daniela_Rodrigues", role:"Finance-mex", wallet:"R80", dept:"Finance", sha: computeAgentHash("Daniela_Rodrigues")},
  {id:"twin-mex-015", name:"Jose S Sobrinho", handle:"Jose_S_Sobrinho", role:"Finance-mex", wallet:"R80", dept:"Finance", sha: computeAgentHash("Jose_S_Sobrinho")},
  {id:"twin-mex-016", name:"Mariana Castro", handle:"Mariana_Castro", role:"Finance-mex", wallet:"R80", dept:"Finance", sha: computeAgentHash("Mariana_Castro")},
  {id:"twin-mex-017", name:"Sofia Oliveira", handle:"Sofia_Oliveira", role:"Finance-mex", wallet:"R80", dept:"Finance", sha: computeAgentHash("Sofia_Oliveira")},
  {id:"twin-mex-018", name:"Victor Fernandes", handle:"Victor_Fernandes", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Victor_Fernandes")},
  {id:"twin-mex-019", name:"Carolina Silva", handle:"Carolina_Silva", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Carolina_Silva")},
  {id:"twin-mex-020", name:"Andre Campos", handle:"Andre_Campos", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Andre_Campos")},
  {id:"twin-mex-021", name:"Renato Azevedo", handle:"Renato_Azevedo", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Renato_Azevedo")},
  {id:"twin-mex-022", name:"Clara Vieira", handle:"Clara_Vieira", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Clara_Vieira")},
  {id:"twin-mex-023", name:"Rafaela Costa", handle:"Rafaela_Costa", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Rafaela_Costa")},
  {id:"twin-mex-024", name:"Roberto Lima", handle:"Roberto_Lima", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Roberto_Lima")},
  {id:"twin-mex-025", name:"Patricia Alves", handle:"Patricia_Alves", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Patricia_Alves")},
  {id:"twin-mex-026", name:"Thiago Ferreira", handle:"Thiago_Ferreira", role:"Erp-mex", wallet:"R80", dept:"ERP", sha: computeAgentHash("Thiago_Ferreira")},
  {id:"twin-mex-027", name:"Julio Cesar", handle:"Julio_Cesar", role:"Commercial-mex", wallet:"R80", dept:"Commercial", sha: computeAgentHash("Julio_Cesar")},
  {id:"twin-mex-028", name:"Patrica Ferraz", handle:"Patrica_Ferraz", role:"Commercial-mex", wallet:"R80", dept:"Commercial", sha: computeAgentHash("Patrica_Ferraz")},
  {id:"twin-mex-029", name:"Joana Shultz", handle:"Joana_Shultz", role:"Commercial-mex", wallet:"R80", dept:"Commercial", sha: computeAgentHash("Joana_Shultz")},
  {id:"twin-mex-030", name:"Luiza Stein", handle:"Luiza_Stein", role:"Commercial-mex", wallet:"R80", dept:"Commercial", sha: computeAgentHash("Luiza_Stein")},
  {id:"twin-mex-031", name:"Marcos Vinicius", handle:"Marcos_Vinicius", role:"Commercial-mex", wallet:"R80", dept:"Commercial", sha: computeAgentHash("Marcos_Vinicius")},
  {id:"twin-mex-032", name:"Ana Paula", handle:"Ana_Paula", role:"Commercial-mex", wallet:"R80", dept:"Commercial", sha: computeAgentHash("Ana_Paula")},
  {id:"twin-mex-033", name:"Ricardo Alves", handle:"Ricardo_Alves", role:"Commercial-mex", wallet:"R80", dept:"Commercial", sha: computeAgentHash("Ricardo_Alves")},
  {id:"twin-mex-034", name:"Juliana Ferreira", handle:"Juliana_Ferreira", role:"Commercial-mex", wallet:"R80", dept:"Commercial", sha: computeAgentHash("Juliana_Ferreira")},
  {id:"twin-mex-035", name:"Lucia Mendes", handle:"Lucia_Mendes", role:"Support-mex", wallet:"R80", dept:"Support", sha: computeAgentHash("Lucia_Mendes")},
  {id:"twin-mex-036", name:"Laura Santos", handle:"Laura_Santos", role:"Support-mex", wallet:"R80", dept:"Support", sha: computeAgentHash("Laura_Santos")},
  {id:"twin-mex-037", name:"Pedro Silva", handle:"Pedro_Silva", role:"Support-mex", wallet:"R80", dept:"Support", sha: computeAgentHash("Pedro_Silva")},
  {id:"twin-mex-038", name:"Luiza Peroux", handle:"Luiza_Peroux", role:"Support-mex", wallet:"R80", dept:"Support", sha: computeAgentHash("Luiza_Peroux")},
  {id:"twin-mex-039", name:"Bruno Souza", handle:"Bruno_Souza", role:"Support-mex", wallet:"R80", dept:"Support", sha: computeAgentHash("Bruno_Souza")},
  {id:"twin-mex-040", name:"Carla Esper", handle:"Carla_Esper", role:"Support-mex", wallet:"R80", dept:"Support", sha: computeAgentHash("Carla_Esper")},
  {id:"twin-mex-041", name:"Luiza Albuquerque", handle:"Luiza_Albuquerque", role:"Support-mex", wallet:"R80", dept:"Support", sha: computeAgentHash("Luiza_Albuquerque")},
  {id:"twin-mex-042", name:"Roberta Almeida", handle:"Roberta_Almeida", role:"Support-mex", wallet:"R80", dept:"Support", sha: computeAgentHash("Roberta_Almeida")},
  {id:"twin-mex-043", name:"Fernanda Lima", handle:"Fernanda_Lima", role:"Crm-mex", wallet:"R80", dept:"CRM", sha: computeAgentHash("Fernanda_Lima")},
  {id:"twin-mex-044", name:"Rodrigo Souza", handle:"Rodrigo_Souza", role:"Crm-mex", wallet:"R80", dept:"CRM", sha: computeAgentHash("Rodrigo_Souza")},
  {id:"twin-mex-045", name:"Boberto Loyola", handle:"Boberto_Loyola", role:"Crm-mex", wallet:"R80", dept:"CRM", sha: computeAgentHash("Boberto_Loyola")},
  {id:"twin-mex-046", name:"Paula Fernandes", handle:"Paula_Fernandes", role:"Crm-mex", wallet:"R80", dept:"CRM", sha: computeAgentHash("Paula_Fernandes")},
  {id:"twin-mex-047", name:"Pedro Henrique", handle:"Pedro_Henrique", role:"Crm-mex", wallet:"R80", dept:"CRM", sha: computeAgentHash("Pedro_Henrique")},
  {id:"twin-mex-048", name:"Ernesto Oliveira", handle:"Ernesto_Oliveira", role:"Crm-mex", wallet:"R80", dept:"CRM", sha: computeAgentHash("Ernesto_Oliveira")},
  {id:"twin-mex-049", name:"Mariana Silva", handle:"Mariana_Silva", role:"Crm-mex", wallet:"R80", dept:"CRM", sha: computeAgentHash("Mariana_Silva")},
  {id:"twin-mex-050", name:"Ana Clara", handle:"Ana_Clara", role:"Crm-mex", wallet:"R80", dept:"CRM", sha: computeAgentHash("Ana_Clara")},
] as const;
