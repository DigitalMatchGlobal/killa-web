#!/usr/bin/env node
/**
 * Corre los tests de reglas críticas contra el stack local de Supabase.
 *
 * Toma las credenciales de `supabase status -o env`, así que no hay que setear
 * nada a mano ni guardar claves en el repo.
 *
 * GUARDARRAÍL: si la URL que devuelve la CLI no es local, aborta. Estos tests
 * crean usuarios, escriben notas y suben archivos: no deben tocar producción
 * jamás. No relajar esta comprobación.
 */

import { execFileSync, spawnSync } from "node:child_process";

function supabaseEnv() {
  try {
    const raw = execFileSync("supabase", ["status", "-o", "env"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    const env = {};
    for (const line of raw.split("\n")) {
      const match = line.match(/^([A-Z_]+)="?(.*?)"?$/);
      if (match) env[match[1]] = match[2];
    }
    return env;
  } catch {
    console.error(
      "\nNo se pudo leer el estado de Supabase. ¿Está levantado el stack local?\n" +
        "  npm run supabase:start\n",
    );
    process.exit(1);
  }
}

const env = supabaseEnv();
const url = env.API_URL ?? "";
const anonKey = env.ANON_KEY ?? "";
const serviceKey = env.SERVICE_ROLE_KEY ?? "";

if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url)) {
  console.error(
    `\nABORTADO: la URL de Supabase no es local ("${url}").\n` +
      "Estos tests escriben datos y sólo corren contra el stack de desarrollo.\n",
  );
  process.exit(1);
}

if (!anonKey || !serviceKey) {
  console.error("\nFaltan las claves locales que devuelve `supabase status`.\n");
  process.exit(1);
}

console.log(`Reglas críticas contra ${url} (stack local)\n`);

const result = spawnSync(
  "npx",
  ["vitest", "run", "--config", "vitest.rules.config.mts"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
      SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    },
  },
);

process.exit(result.status ?? 1);
