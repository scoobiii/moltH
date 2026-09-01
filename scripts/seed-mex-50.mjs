import { SOVEREIGN, WALLETS } from '../src/server/security/sovereignVault.ts' assert {type: 'json'} 
// 50 colaboradores mex-427273fd
console.log("ORG", SOVEREIGN.ORG_ID)
console.log("OWNER", SOVEREIGN.OWNER_EMAIL)
console.log("WALLETS 6 x 4000 =", WALLETS.length * 4000)
console.log("Se 50 collaborators = 50 USER, cada wallet precisa scale")
// BiAgent distribui R4k por colaborador? 4000/50 = R80 por colaborador
