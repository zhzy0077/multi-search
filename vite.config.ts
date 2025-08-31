import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [tailwindcss(), solidPlugin(), visualizer()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
