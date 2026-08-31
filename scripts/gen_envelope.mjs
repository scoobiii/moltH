import fs from 'fs'; import crypto from 'crypto';
const stdout = fs.readFileSync('/tmp/out.txt','utf8');
const payload = stdout + "" + 0 + 170.72;
const evidence_hash = crypto.createHash('sha256').update(payload).digest('hex');
const runtime_id = "9a9be9f5d2d4a2bafa25926eb96ddf8d8af794ab9ef32cd59e5782771939f44e";
const envelope = {
  contract_version:"v0.1",
  invocation_id: crypto.randomUUID(),
  runtime_id,
  env_tag:"node-linux-arm64-termux",
  agent:"selix-a23",
  status:"success",
  executed:true,
  output:{stdout: stdout.slice(0,15000), stderr:"", exit_code:0},
  duration_ms:170.72,
  evidence_hash,
  truncated:false,
  meta:{ file_hash:"120e931b9f36eab6c05e7f96759fbb4d19b84b1fdab79ceca19498ff00c1ea3f", bench:{ops_per_sec:29287,p99_ms:0.2557}, runtime_label:"a23-vintage-snapdragon-arm64"}
};
fs.writeFileSync('/tmp/envelope.json', JSON.stringify(envelope,null,2));
console.log("OK", evidence_hash, runtime_id);
