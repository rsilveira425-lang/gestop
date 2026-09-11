import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pastas renomeadas para português — o Vite precisa saber onde elas estão.
  publicDir: 'arquivos-publicos (public)',
})
