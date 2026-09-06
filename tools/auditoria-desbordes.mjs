#!/usr/bin/env node
/**
 * Auditoría de desbordes horizontales, mobile-first.
 *
 * Recorre las rutas públicas en varios anchos reales de teléfono y reporta
 * TODO elemento que se salga del ancho del documento. Existe porque
 * `body { overflow-x: hidden }` (en `app/globals.css`) esconde el scroll
 * horizontal pero NO el problema: el contenido igual queda cortado contra el
 * margen derecho y no hay forma de leerlo. Un desborde acá es invisible en
 * desktop y se ve como texto mutilado en el celular.
 *
 * Playwright no es dependencia del proyecto: si vas a correr esto, instalalo
 * aparte (`npm i -D playwright`). Usa el Chrome del sistema, así que no hace
 * falta bajar navegadores.
 *
 * Uso:
 *   npm run dev                        # o npm run build && npm start
 *   node tools/auditoria-desbordes.mjs                     # usa :4322
 *   BASE=http://127.0.0.1:4399 node tools/auditoria-desbordes.mjs
 *   PATHS=/tv,/tv/noticias/mi-nota WIDTHS=320,390 node tools/auditoria-desbordes.mjs
 *
 * Sale con código 1 si encuentra desbordes, para poder colgarlo de un CI.
 */

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("\nFalta Playwright. Instalalo con:\n  npm i -D playwright\n");
  process.exit(2);
}

const BASE = (process.env.BASE ?? "http://127.0.0.1:4322").replace(/\/$/, "");
const WIDTHS = (process.env.WIDTHS ?? "320,360,375,390,414,768,1024,1280").split(",").map(Number);
const PATHS = (process.env.PATHS ?? "/,/tv,/tv/categoria/noticias,/tv/categoria/deportes,/tv/categoria/turismo,/tv/panel/ingresar")
  .split(",")
  .filter(Boolean);

/** Corre dentro del navegador: busca lo que se sale de la caja. */
function probe() {
  const docW = document.documentElement.clientWidth;
  const out = [];

  for (const el of document.querySelectorAll("body *")) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;

    const overflowsRight = rect.right > docW + 1;
    const overflowsLeft = rect.left < -1;
    // Un scroller declarado (`overflow-x: auto`) no es un desborde: es una
    // decisión de diseño, como la barra de secciones del header.
    const declaredScroller = style.overflowX === "auto" || style.overflowX === "scroll" || style.overflowX === "hidden";
    const scrolls = el.scrollWidth > el.clientWidth + 1 && !declaredScroller;
    if (!overflowsRight && !overflowsLeft && !scrolls) continue;

    // Si un ancestro lo recorta y ese ancestro sí entra en pantalla, el
    // desborde queda contenido. `body` no cuenta: su overflow-x oculto es
    // justamente la venda que queremos sacar.
    let contained = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.overflowX !== "visible") {
        const pr = p.getBoundingClientRect();
        if (pr.right <= docW + 1 && pr.left >= -1) contained = true;
        break;
      }
    }
    if (contained) continue;

    // Sólo el culpable más externo: si el padre ya desborda, el hijo es eco.
    const parent = el.parentElement;
    if (parent && parent !== document.body && !scrolls) {
      const pr = parent.getBoundingClientRect();
      if (pr.right > docW + 1 || pr.left < -1) continue;
    }

    const path = [];
    for (let n = el; n && path.length < 4; n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (typeof n.className === "string" && n.className.trim()) {
        s += "." + n.className.trim().split(/\s+/).slice(0, 4).join(".");
      }
      path.unshift(s);
    }

    out.push({
      sel: path.join(" > "),
      text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 70),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
    });
  }

  return { docW, docScrollW: document.documentElement.scrollWidth, items: out };
}

const browser = await chromium.launch({ channel: "chrome" });
let total = 0;
let errores = 0;

for (const path of PATHS) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 850 },
      isMobile: width < 700,
      hasTouch: width < 700,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    try {
      await page.goto(BASE + path, { waitUntil: "load", timeout: 45_000 });
      // Medir antes de que carguen las fuentes da anchos falsos: una tipografía
      // de fallback más angosta puede tapar un desborde que sí existe.
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const res = await page.evaluate(probe);

      if (res.items.length === 0 && res.docScrollW <= res.docW + 1) {
        console.log(`✅ ${path} @${width}px`);
      } else {
        total += res.items.length || 1;
        console.log(`\n❌ ${path} @${width}px — ancho del documento ${res.docScrollW}px sobre una pantalla de ${res.docW}px`);
        for (const item of res.items.slice(0, 10)) {
          console.log(`   right=${item.right} (scroll ${item.scrollW}/${item.clientW})`);
          console.log(`   ${item.sel}`);
          if (item.text) console.log(`   "${item.text}"`);
        }
      }
    } catch (error) {
      // Un fallo de carga NO es un desborde: se cuenta aparte para que el
      // resumen no mienta sobre qué encontró la auditoría.
      errores += 1;
      console.log(`⚠️  ${path} @${width}px — no se pudo medir: ${String(error).split("\n")[0]}`);
    }

    await context.close();
  }
}

await browser.close();

if (errores > 0) {
  console.error(`\n${errores} ruta(s) no se pudieron medir (¿está levantado el sitio en ${BASE}?).`);
}
if (total > 0) {
  console.error(`\n${total} desborde(s). En mobile eso se ve como texto cortado contra el margen derecho.`);
}
if (total > 0 || errores > 0) process.exit(1);
console.log("\nSin desbordes horizontales.");
