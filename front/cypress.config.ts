import { defineConfig } from 'cypress'
import setupNodeEvents from './cypress/plugins/index'

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  video: false,
  e2e: {
    setupNodeEvents,
    baseUrl: 'http://localhost:4200',
  },
})
