import { defineConfig } from "astro/config";
import aws from "astro-sst/lambda";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: aws(),
  vite: {
    optimizeDeps: {
      exclude: ["sst"],
    },
  },
  integrations: [tailwind(), image()],
});
