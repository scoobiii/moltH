import admin from "firebase-admin"
import { readFileSync } from "fs"
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(readFileSync("./firebase-service-account.json","utf8"))), projectId: "ais-dev-4tmvuvv55hemt6f75zz2ga" })
const db = admin.firestore()
const ORG_ID = "mex-427273fd"
const H_ROOT = "sha256:427273fd-Zeh-Sobrinho-ROOT"
await db.collection("organizations").doc(ORG_ID).set({ name:"MEx Cliente", orgId:ORG_ID, H_ROOT_HASH:H_ROOT, owner_id:"H-427273fd-Zeh-Sobrinho", plan:"enterprise", status:"active", created_at:admin.firestore.FieldValue.serverTimestamp() }, {merge:true})
console.log("ORG MEx criada",ORG_ID)
