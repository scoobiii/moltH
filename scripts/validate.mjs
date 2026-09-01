import fs from 'fs'; import { validateContractEnvelope } from '/root/moltH/src/server/vortexContract.ts';
const e = JSON.parse(fs.readFileSync('/tmp/envelope.json','utf8'));
console.log(validateContractEnvelope(e));
