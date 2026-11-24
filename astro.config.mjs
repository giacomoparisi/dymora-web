import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dymora.eu',
  output: 'static',
  build: {
    inlineStylesheets: 'never',
  },
});
