import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineConfig({
  plugins: [nodePolyfills(), solidPlugin()],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis", //<-- AWS SDK
      },
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
})
