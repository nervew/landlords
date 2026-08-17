import Link from "next/link";
import { Sprout } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-[var(--forest)]"
      aria-label="Raíz de Pueblo, ir al inicio"
    >
      <span className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-white">
        <Sprout aria-hidden="true" size={21} strokeWidth={2.2} />
      </span>
      <span className="font-serif text-xl font-bold tracking-tight">
        Raíz de Pueblo
      </span>
    </Link>
  );
}
