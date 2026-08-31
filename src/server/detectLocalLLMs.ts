import fs from "fs"
import os from "os"
import dotenv from "dotenv"
try{ dotenv.config() }catch{}
try{ dotenv.config({path: ".env"}) }catch{}

export function detectLocalLLMs(){
  const paths = [
    process.env.HOME+"/models",
    "/data/data/com.termux/files/home/models",
    process.env.HOME+"/.ollama/models",
    "/data/data/com.termux/files/usr/models",
    process.env.HOME+"/.cache/lm-studio/models"
  ]
  const found=[]
  for(const p of paths){
    if(fs.existsSync(p)){
      try{
        fs.readdirSync(p).forEach(f=>{
          if(f.endsWith(".gguf")||f.endsWith(".bin")){
            const stat = fs.statSync(p+"/"+f)
            found.push({name:f, path:p+"/"+f, size: stat.size, gb: (stat.size/1e9).toFixed(1)})
          }
        })
      }catch{}
    }
  }
  return {
    isTermux: fs.existsSync("/data/data/com.termux") || !!process.env.TERMUX_VERSION || !!process.env.TERMUX__USER_ID,
    arch: os.arch(),
    platform: os.platform(),
    hostname: os.hostname(),
    localModels: found,
    hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length>20,
    geminiKeyLen: process.env.GEMINI_API_KEY?.length||0,
    sovereignCount: 15,
    envelopes: (()=>{ try{ return fs.readdirSync("docs/envelopes-sprint1").length }catch{return 0} })(),
    envTag: `node-${os.arch()}-termux-static-vm`
  }
}
