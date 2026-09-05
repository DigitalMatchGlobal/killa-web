"use client";

import { useActionState } from "react";
import { AlertCircle, Archive, FileText, Send } from "lucide-react";

import {
  archiveArticleAction,
  publishArticleAction,
  unpublishArticleAction,
  type ActionResult,
} from "@/lib/editorial/actions";
import { STATUS_LABELS } from "@/lib/editorial/format";
import type { PanelArticle } from "@/lib/editorial/types";

/**
 * Transiciones de estado de una nota.
 *
 * Cada botón es un form con su propia Server Action: publicar, archivar (la
 * baja editorial) y volver a borrador. No existe "eliminar" — ni acá ni en la
 * base, que no tiene policy de DELETE sobre `articles`.
 *
 * Publicar valida en el servidor los requisitos (imagen, texto alternativo,
 * bajada y cuerpo mínimos). Si falta algo, el mensaje aparece acá.
 */
export function StatusActions({ article }: { article: PanelArticle }) {
  const [publishState, publish, publishing] = useActionState<ActionResult | null, FormData>(
    publishArticleAction,
    null,
  );
  const [archiveState, archive, archiving] = useActionState<ActionResult | null, FormData>(
    archiveArticleAction,
    null,
  );
  const [draftState, toDraft, draftPending] = useActionState<ActionResult | null, FormData>(
    unpublishArticleAction,
    null,
  );

  const error =
    (publishState && !publishState.ok && publishState.error) ||
    (archiveState && !archiveState.ok && archiveState.error) ||
    (draftState && !draftState.ok && draftState.error) ||
    null;

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
            Estado
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            {STATUS_LABELS[article.status] ?? article.status}
          </p>
        </div>
        <span
          className={
            "rounded-full px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] " +
            (article.status === "published"
              ? "bg-emerald-400/12 text-emerald-300"
              : article.status === "archived"
                ? "bg-fg-faint/10 text-fg-faint"
                : "bg-sand/12 text-sand")
          }
        >
          {STATUS_LABELS[article.status] ?? article.status}
        </span>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {article.status !== "published" ? (
          <form action={publish}>
            <input type="hidden" name="id" value={article.id} />
            <button
              type="submit"
              disabled={publishing}
              className="btn bg-sand w-full text-midnight hover:bg-sand/90 disabled:opacity-60"
            >
              {publishing ? "Publicando…" : "Publicar"}
              <Send size={15} aria-hidden />
            </button>
          </form>
        ) : (
          <form action={toDraft}>
            <input type="hidden" name="id" value={article.id} />
            <button
              type="submit"
              disabled={draftPending}
              className="btn btn-ghost w-full disabled:opacity-60"
            >
              {draftPending ? "Guardando…" : "Volver a borrador"}
              <FileText size={15} aria-hidden />
            </button>
          </form>
        )}

        {article.status !== "archived" ? (
          <form action={archive}>
            <input type="hidden" name="id" value={article.id} />
            <button
              type="submit"
              disabled={archiving}
              className="btn btn-ghost w-full hover:border-red-400/60 disabled:opacity-60"
            >
              {archiving ? "Archivando…" : "Archivar"}
              <Archive size={15} aria-hidden />
            </button>
          </form>
        ) : null}
      </div>

      <p className="mt-4 font-mono text-[0.55rem] leading-relaxed text-fg-faint">
        Archivar saca la nota del portal sin borrarla: se puede volver a publicar
        cuando quieran.
      </p>
    </section>
  );
}
