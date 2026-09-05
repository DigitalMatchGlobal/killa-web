import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * Render compartido por la nota pública y la vista previa del editor.
 * React Markdown no interpreta HTML crudo y escapa el contenido por defecto;
 * no se habilita `rehype-raw`, por lo que el Markdown editorial no puede
 * inyectar scripts ni atributos HTML.
 */
export function MarkdownContent({
  body,
  compact = false,
}: {
  body: string;
  compact?: boolean;
}) {
  if (!body.trim()) {
    return <p className="text-fg-faint">El cuerpo de la nota está vacío.</p>;
  }

  return (
    <div
      className={cn(
        "min-w-0 text-fg-muted [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        compact ? "text-sm leading-7" : "text-[1.05rem] leading-8",
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ className, ...props }) => (
            <h2
              className={cn(
                "mb-4 mt-10 font-display font-bold leading-tight tracking-tight text-fg",
                compact ? "text-xl" : "text-2xl sm:text-3xl",
                className,
              )}
              {...props}
            />
          ),
          h3: ({ className, ...props }) => (
            <h3
              className={cn(
                "mb-3 mt-8 font-display font-semibold leading-tight text-fg",
                compact ? "text-lg" : "text-xl sm:text-2xl",
                className,
              )}
              {...props}
            />
          ),
          p: ({ className, ...props }) => (
            <p className={cn("my-5", className)} {...props} />
          ),
          strong: ({ className, ...props }) => (
            <strong className={cn("font-semibold text-fg", className)} {...props} />
          ),
          em: ({ className, ...props }) => (
            <em className={cn("italic text-fg", className)} {...props} />
          ),
          ul: ({ className, ...props }) => (
            <ul className={cn("my-5 list-disc space-y-2 pl-6 marker:text-cyan", className)} {...props} />
          ),
          ol: ({ className, ...props }) => (
            <ol className={cn("my-5 list-decimal space-y-2 pl-6 marker:text-cyan", className)} {...props} />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote
              className={cn(
                "my-8 border-l-2 border-cyan bg-surface/55 px-5 py-4 font-display text-lg font-medium leading-relaxed text-fg",
                className,
              )}
              {...props}
            />
          ),
          a: ({ className, ...props }) => (
            <a
              className={cn("font-medium text-cyan underline decoration-cyan/35 underline-offset-4 hover:decoration-cyan", className)}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          hr: (props) => <hr className="my-10 border-line" {...props} />,
          img: ({ className, alt, ...props }: ComponentPropsWithoutRef<"img">) => (
            // Las imágenes internas del cuerpo pueden venir de Storage o de
            // un medio externo; el navegador las carga en forma diferida.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={cn("my-8 aspect-video w-full rounded-2xl border border-line object-cover", className)}
              alt={alt ?? ""}
              loading="lazy"
              {...props}
            />
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
