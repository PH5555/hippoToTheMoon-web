import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // sockjs-client가 브라우저에서 global 객체를 찾을 수 있도록 폴리필
    global: 'globalThis',
  },
})
