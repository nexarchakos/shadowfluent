import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vite automatically exposes env variables prefixed with VITE_
  // No need for manual configuration
})
