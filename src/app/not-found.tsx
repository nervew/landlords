import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-shell grid min-h-[70vh] place-items-center py-20 text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e8efe9] text-[var(--forest)]">
          <MapPinOff aria-hidden="true" size={28} />
        </span>
        <p className="eyebrow mt-6">Error 404</p>
        <h1 className="mt-3 text-balance text-5xl text-[var(--forest)]">
          Esta ruta no lleva a una propiedad publicada
        </h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-[var(--muted)]">
          Puede que el enlace haya cambiado o que la propiedad no exista en este
          catálogo demostrativo.
        </p>
        <Link
          href="/propiedades"
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--forest)] px-6 font-bold text-white"
        >
          <ArrowLeft aria-hidden="true" size={18} /> Volver al catálogo
        </Link>
      </div>
    </section>
  );
}
