"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  ImagePlus,
  LockKeyhole,
  Plus,
  Send,
  Upload,
} from "lucide-react";

import { tvNews } from "@/lib/tv-news";

type PanelMode = "dashboard" | "new" | "success";

const starterTitle = "Así crece la red de Killa en los Valles Calchaquíes";
const starterExcerpt =
  "Infraestructura propia, trabajo local y nuevas conexiones para las comunidades del norte.";

export default function EditorialPanelMockup() {
  const [mode, setMode] = useState<PanelMode>("dashboard");
  const [title, setTitle] = useState(starterTitle);
  const [excerpt, setExcerpt] = useState(starterExcerpt);
  const [category, setCategory] = useState("Noticias");

  const changeMode = (next: PanelMode) => {
    setMode(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-night text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-midnight/92 backdrop-blur-xl">
        <div className="shell flex h-[68px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sand/10 text-sand">
              <LockKeyhole size={17} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">Panel Killa TV</p>
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-fg-faint">
                Demo editorial
              </p>
            </div>
          </div>
          <Link
            href="/tv"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-line px-3 text-xs text-fg-muted hover:border-sand/60 hover:text-fg"
          >
            <ArrowLeft size={14} aria-hidden />
            <span className="hidden sm:inline">Portal público</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      {mode === "dashboard" && <Dashboard onCreate={() => changeMode("new")} />}
      {mode === "new" && (
        <Composer
          title={title}
          excerpt={excerpt}
          category={category}
          onTitle={setTitle}
          onExcerpt={setExcerpt}
          onCategory={setCategory}
          onCancel={() => changeMode("dashboard")}
          onPublish={(event) => {
            event.preventDefault();
            changeMode("success");
          }}
        />
      )}
      {mode === "success" && (
        <Success
          title={title}
          onAnother={() => changeMode("new")}
          onDashboard={() => changeMode("dashboard")}
        />
      )}
    </div>
  );
}

function ProposalNotice() {
  return (
    <div className="rounded-xl border border-sand/25 bg-sand/[0.06] px-4 py-3 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.1em] text-sand sm:text-[0.62rem]">
      Demo navegable · el acceso privado y la base de datos se implementan en la Etapa 1
    </div>
  );
}

function Dashboard({ onCreate }: { onCreate: () => void }) {
  return (
    <main className="shell py-7 sm:py-10">
      <ProposalNotice />
      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-sand">Administración editorial</p>
          <h1 className="display mt-3 text-[clamp(2rem,7vw,3.4rem)]">Noticias</h1>
          <p className="mt-2 text-sm text-fg-muted">Crear, previsualizar y publicar en pocos pasos.</p>
        </div>
        <button type="button" onClick={onCreate} className="btn btn-primary w-full sm:w-auto">
          <Plus size={17} aria-hidden />
          Nueva noticia
        </button>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: FileText, value: "3", label: "Publicadas" },
          { icon: Edit3, value: "0", label: "Borradores" },
          { icon: ImagePlus, value: "3", label: "Imágenes" },
          { icon: BarChart3, value: "SEO", label: "Preparado" },
        ].map(({ icon: Icon, value, label }) => (
          <article key={label} className="card p-4 sm:p-5">
            <Icon size={17} className="text-sand" aria-hidden />
            <p className="mt-4 font-display text-2xl font-semibold">{value}</p>
            <p className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">{label}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-midnight/60">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <h2 className="font-display text-sm font-semibold">Publicaciones recientes</h2>
          <span className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-emerald-300">3 publicadas</span>
        </div>
        <div className="divide-y divide-line">
          {tvNews.map((article) => (
            <article key={article.slug} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[84px_1fr_auto] sm:gap-4 sm:px-5">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-line">
                <Image src={article.image} alt="" fill sizes="84px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-sand">{article.category}</p>
                <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold sm:text-base">{article.title}</h3>
              </div>
              <Link
                href={"/tv/noticias/" + article.slug}
                aria-label={"Previsualizar " + article.title}
                className="grid size-9 place-items-center rounded-full border border-line text-fg-muted hover:border-sand/60 hover:text-fg"
              >
                <Eye size={15} aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

type ComposerProps = {
  title: string;
  excerpt: string;
  category: string;
  onTitle: (value: string) => void;
  onExcerpt: (value: string) => void;
  onCategory: (value: string) => void;
  onCancel: () => void;
  onPublish: (event: FormEvent<HTMLFormElement>) => void;
};

function Composer({
  title,
  excerpt,
  category,
  onTitle,
  onExcerpt,
  onCategory,
  onCancel,
  onPublish,
}: ComposerProps) {
  return (
    <main className="shell py-6 sm:py-9">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
          <ArrowLeft size={16} aria-hidden />
          Noticias
        </button>
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-fg-faint">Borrador guardado</span>
      </div>

      <div className="mt-5">
        <p className="eyebrow text-sand">Alta editorial</p>
        <h1 className="display mt-3 text-[clamp(2rem,8vw,3.5rem)]">Nueva noticia</h1>
        <p className="mt-2 text-sm text-fg-muted">Completá, revisá y publicá. Sin asistencia técnica.</p>
      </div>

      <ol className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-line bg-midnight/55" aria-label="Pasos de publicación">
        {["Contenido", "Portada", "Publicar"].map((step, index) => (
          <li key={step} className={"flex items-center gap-2 px-3 py-3 " + (index > 0 ? "border-l border-line" : "")}>
            <span className={"grid size-5 shrink-0 place-items-center rounded-full text-[0.62rem] font-semibold " + (index === 0 ? "bg-sand text-midnight" : "border border-line-strong text-fg-faint")}>
              {index + 1}
            </span>
            <span className="hidden text-xs font-medium text-fg-muted sm:inline">{step}</span>
          </li>
        ))}
      </ol>

      <form onSubmit={onPublish} className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <div className="card p-5 sm:p-7">
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">Categoría</span>
              <select value={category} onChange={(event) => onCategory(event.target.value)} className="min-h-12 w-full rounded-xl border border-line bg-midnight px-4 text-sm text-fg outline-none focus:border-sand">
                <option>Noticias</option>
                <option>Deportes</option>
                <option>Turismo</option>
                <option>Institucional</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">
                Título <span>{title.length}/90</span>
              </span>
              <textarea value={title} onChange={(event) => onTitle(event.target.value)} maxLength={90} rows={3} className="w-full resize-none rounded-xl border border-line bg-midnight px-4 py-3 font-display text-lg font-semibold leading-snug text-fg outline-none focus:border-sand" />
            </label>

            <label className="grid gap-2">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">Bajada</span>
              <textarea value={excerpt} onChange={(event) => onExcerpt(event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-line bg-midnight px-4 py-3 text-sm leading-relaxed text-fg outline-none focus:border-sand" />
            </label>

            <div>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">Imagen de portada</p>
              <button type="button" className="mt-2 flex min-h-24 w-full items-center gap-4 rounded-xl border border-dashed border-line-strong bg-midnight/55 px-4 text-left transition-colors hover:border-sand/60">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand/10 text-sand">
                  <Upload size={18} aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-fg">Elegir una imagen</span>
                  <span className="mt-0.5 block text-xs text-fg-faint">JPG o PNG · recorte automático</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-fg-faint">Vista previa</p>
          <div className="overflow-hidden rounded-2xl border border-line bg-midnight">
            <div className="relative aspect-[16/10]">
              <Image src={tvNews[0].image} alt="" fill sizes="(max-width: 1024px) 100vw, 35vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/15 to-transparent" />
            </div>
            <div className="p-5">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-sand">{category}</p>
              <h2 className="mt-2 font-display text-xl font-semibold leading-tight">{title || "Título de la noticia"}</h2>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{excerpt || "La bajada aparecerá acá."}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-ghost px-3">
              <Eye size={16} aria-hidden />
              Previsualizar
            </button>
            <button type="submit" className="btn bg-sand px-3 text-midnight hover:bg-sand/90">
              Publicar <Send size={15} aria-hidden />
            </button>
          </div>
        </aside>
      </form>
    </main>
  );
}

function Success({
  title,
  onAnother,
  onDashboard,
}: {
  title: string;
  onAnother: () => void;
  onDashboard: () => void;
}) {
  return (
    <main className="shell grid min-h-[calc(100svh-68px)] place-items-center py-10">
      <div className="card w-full max-w-xl p-7 text-center sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-400/12 text-emerald-300">
          <Check size={25} aria-hidden />
        </span>
        <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.13em] text-emerald-300">Lista para publicar</p>
        <h1 className="display mt-3 text-3xl">Así de simple.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-fg-muted">
          “{title}” ya tendría su página, vista previa para redes y estado de publicación.
        </p>
        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onDashboard} className="btn btn-ghost">Volver al panel</button>
          <button type="button" onClick={onAnother} className="btn bg-sand text-midnight hover:bg-sand/90">
            Crear otra <ChevronRight size={16} aria-hidden />
          </button>
        </div>
        <p className="mt-5 font-mono text-[0.5rem] uppercase tracking-[0.09em] text-fg-faint">Demostración visual · no guarda datos reales</p>
      </div>
    </main>
  );
}
