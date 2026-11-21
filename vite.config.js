import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Los destinos del proxy se configuran en los archivos .env (o en el entorno, que tiene prioridad).
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }

  // El backend M3 no autoriza el origen del navegador: en desarrollo las llamadas usan el mismo
  // origen (`/api/m3/api/v1/...`) y este proxy las redirige al servicio real, quitando el prefijo
  // `/api/m3` para llegar a las rutas `/api/v1/...`.
  const M3_PROXY_TARGET = env.M3_PROXY_TARGET ?? 'http://localhost:8080'

  // M1 (flota) tampoco se consume cross-origin: `/api/m1/api/v1/...` llega a M1 sin depender de su CORS.
  const M1_PROXY_TARGET = env.M1_PROXY_TARGET ?? 'http://localhost:8081'

  // M2 (reservas) sí publica CORS, pero su lista de orígenes fija el puerto del frontend. Pasarlo
  // también por el proxy deja el desarrollo en un solo origen, funcione en el puerto que funcione.
  const M2_PROXY_TARGET = env.M2_PROXY_TARGET ?? 'http://localhost:8082'

  return {
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
        '/api/m2': {
          target: M2_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/m2/, ''),
        },
        '/api/m3': {
          target: M3_PROXY_TARGET,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/m3/, ''),
        },
      },
    },
  }
})
