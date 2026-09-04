import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/** Tests unitarios: reglas puras, sin base ni red. */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
