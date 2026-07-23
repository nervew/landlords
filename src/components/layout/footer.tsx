import Link from "next/link";
import { Camera, Mail, MessageCircle } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--forest)] text-white">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="[&_a]:text-white [&_span:first-child]:bg-white [&_span:first-child]:text-[var(--forest)]">
            <Logo />
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
            Una vitrina demostrativa para descubrir terrenos con contexto local y
            conversar directamente con quienes conocen la región.
          </p>
          <p className="mt-4 text-xs text-white/55">
            Las propiedades y agencias son ficticias. Las fotografías se usan con
            fines demostrativos y provienen de Pexels.
          </p>
        </div>
        <div>
          <h2 className="font-sans text-sm font-extrabold uppercase tracking-widest text-[#e8c983]">
            Explorar
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-white/75">
            <Link href="/propiedades">Todas las propiedades</Link>
            <Link href="/propiedades?tipo=finca">Fincas</Link>
            <Link href="/propiedades?tipo=lote">Lotes</Link>
            <Link href="/#municipios">Municipios</Link>
          </div>
        </div>
        <div>
          <h2 className="font-sans text-sm font-extrabold uppercase tracking-widest text-[#e8c983]">
            Contacto
          </h2>
          <div className="mt-5 grid gap-4 text-sm text-white/75">
            <a className="inline-flex items-center gap-2" href="mailto:hola@raizdepueblo.demo">
              <Mail aria-hidden="true" size={17} /> hola@raizdepueblo.demo
            </a>
            <a className="inline-flex items-center gap-2" href="https://wa.me/573005550000">
              <MessageCircle aria-hidden="true" size={17} /> WhatsApp
            </a>
            <a className="inline-flex items-center gap-2" href="https://instagram.com" rel="noreferrer" target="_blank">
              <Camera aria-hidden="true" size={17} /> Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:justify-between">
          <span>© 2026 Raíz de Pueblo · Proyecto demostrativo</span>
          <span>Hecho con respeto por el territorio colombiano</span>
        </div>
      </div>
    </footer>
  );
}
