import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// El backend M3 no publica CORS: en desarrollo las llamadas usan el mismo origen
// (`/api/m3/api/v1/...`) y este proxy las redirige al compose del backend (puerto 8080),
// quitando el prefijo `/api/m3` para llegar a las rutas reales `/api/v1/...`.
const M3_PROXY_TARGET = process.env.M3_PROXY_TARGET ?? 'http://localhost:8080'

// M1 (flota) tampoco se consume cross-origin: `/api/m1/api/v1/...` llega a M1 sin depender de su CORS.
const M1_PROXY_TARGET = process.env.M1_PROXY_TARGET ?? 'http://localhost:8081'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    proxy: {
      '/api/m1': {
        target: M1_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/m1/, ''),
      },
      '/api/m3': {
        target: M3_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/m3/, ''),
      },
    },
  },
})
