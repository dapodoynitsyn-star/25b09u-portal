import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // If deploying to GitHub Pages under a repo subpath, set base to '/<repo-name>/'
  base: './',
  server: {
    proxy: {
      // Проксируем расписание СПбГУ при `npm run dev`, чтобы браузер
      // обращался к своему же адресу (localhost) и не упирался в CORS.
      // В продакшене на Vercel этот же путь /api/schedule обслуживает
      // serverless-функция api/schedule.js — работает по тому же принципу.
      '/api/schedule': {
        target: 'https://timetable.spbu.ru',
        changeOrigin: true,
        secure: true,
        rewrite: (reqPath) => {
          const [, query] = reqPath.split('?')
          const params = new URLSearchParams(query)
          const from = params.get('from')
          const to = params.get('to')
          return `/api/v1/groups/429104/events/${from}/${to}?timetable=Primary`
        },
      },
    },
  },
})
