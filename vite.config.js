import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true, // Disable host check
    port: 5173,
    strictPort: true, // Use strict port checking
    open: true, // Open browser automatically
  },
  clearScreen: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || '"development"'
  }
})
