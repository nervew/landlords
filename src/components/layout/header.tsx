import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#faf7f1]/95 backdrop-blur">
      <div className="container-shell flex h-[72px] items-center justify-between gap-5">
        <Logo />
        <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
          <Link className="text-sm font-semibold text-[var(--ink)] hover:text-[var(--earth)]" href="/propiedades">
            Propiedades
          </Link>
          <Link className="text-sm font-semibold text-[var(--ink)] hover:text-[var(--earth)]" href="/#como-funciona">
            Cómo funciona
          </Link>
          <Link className="text-sm font-semibold text-[var(--ink)] hover:text-[var(--earth)]" href="/#inmobiliarias">
            Para inmobiliarias
          </Link>
        </nav>
        <Link
          href="/iniciar-sesion"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--forest)] px-4 text-sm font-bold text-white transition hover:bg-[var(--forest-2)]"
        >
          Administrar
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </header>
  );
}
