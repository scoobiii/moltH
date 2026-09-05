import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { detectLocalLLMs } from './src/server/detectLocalLLMs'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-env',
      configureServer(server){
        server.middlewares.use('/api/env', (_req,res)=>{
          res.setHeader('Content-Type','application/json')
          res.end(JSON.stringify(detectLocalLLMs()))
        })
      }
    }
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { host: true, port: 3000, watch: { ignored: ["**/.data/**","**/*.tmp"] } }
})
