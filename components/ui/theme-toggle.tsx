"use client";

import { Moon, Sun } from "lucide-react";

const THEME_KEY = "killa-color-theme";
let sequenceId = 0;

export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";

    root.dataset.theme = nextTheme;
    root.dataset.themeDirection = nextTheme;
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem(THEME_KEY, nextTheme);

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", nextTheme === "light" ? "#F4F8FC" : "#040A16");

    sequenceId += 1;
    window.dispatchEvent(
      new CustomEvent("killa:theme-sequence", {
        detail: { theme: nextTheme, sequenceId },
      }),
    );
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar entre tema claro y oscuro"
      title="Cambiar colores"
      className="theme-toggle relative grid size-11 shrink-0 place-items-center rounded-full border border-line text-fg-muted transition-[color,border-color,background-color,transform] duration-300 hover:border-cyan/60 hover:bg-fg/[0.04] hover:text-fg active:scale-95"
    >
      <Sun size={17} className="theme-icon theme-icon--sun" aria-hidden />
      <Moon size={16} className="theme-icon theme-icon--moon" aria-hidden />
    </button>
  );
}
