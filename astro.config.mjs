// @ts-check
import { defineConfig, envField } from 'astro/config'
import seederRunnerIntegration from "./src/integrations/seederRunner/index.ts"

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',
  integrations: [
    seederRunnerIntegration()
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  security: {
    checkOrigin: true
  },
  env: {
    schema: {
      FACEBOOK_URL: envField.string({ context: 'server', access: 'public', optional: true }),
      INSTAGRAM_URL: envField.string({ context: 'server', access: 'public', optional: true }),
      TIKTOK_URL: envField.string({ context: 'server', access: 'public', optional: true }),
      YOUTUBE_URL: envField.string({ context: 'server', access: 'public', optional: true }),
      EMAIL: envField.string({ context: 'server', access: 'public', optional: true }),
      PHONE: envField.string({ context: 'server', access: 'public', optional: true }),
      LOCATION: envField.string({ context: 'server', access: 'public', optional: false }),
      LOCATION_URL: envField.string({ context: 'server', access: 'public', optional: false }),
      CONNECTION_STRING: envField.string({ context: 'server', access: 'secret', optional: false })
    }
  }
})