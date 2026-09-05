import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Tests de reglas críticas contra un Supabase REAL (el stack local).
 *
 * Van aparte de los unitarios porque necesitan Docker levantado y escriben
 * datos. El runner (tools/run-rules-tests.mjs) y el propio test abortan si la
 * URL no es local: esto no debe correr nunca contra producción.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    include: ["tests/rules/**/*.test.ts"],
    environment: "node",
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Comparten la misma base: en paralelo se pisan entre archivos.
    fileParallelism: false,
  },
});
