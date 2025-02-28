// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import db from '@astrojs/db'

export default defineConfig({
  output: 'server',
  integrations: [
    db()
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  security: {
    checkOrigin: true
  }
})
