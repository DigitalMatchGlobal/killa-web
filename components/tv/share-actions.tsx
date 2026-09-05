"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const helper = document.createElement("textarea");
        helper.value = url;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copiá este enlace", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm text-fg-muted hover:border-cyan/60 hover:text-fg"
      aria-live="polite"
    >
      {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      {copied ? "Enlace copiado" : "Copiar enlace"}
    </button>
  );
}
