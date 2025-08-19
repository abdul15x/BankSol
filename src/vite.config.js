import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Update this with your repo name if deploying to GitHub Pages
// Example: if repo = simplebank-dapp → base: '/simplebank-dapp/'
export default defineConfig({
  plugins: [react()],
  base: '/simplebank-dapp/',
})
