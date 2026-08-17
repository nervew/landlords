import { MapPin, Search } from "lucide-react";

export function HomeSearch() {
  return (
    <form
      action="/propiedades"
      method="get"
      className="soft-shadow grid gap-3 rounded-2xl bg-white p-3 md:grid-cols-[1.4fr_1fr_auto]"
      aria-label="Buscar propiedades"
    >
      <label className="relative">
        <span className="sr-only">Municipio o departamento</span>
        <MapPin
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--earth)]"
          size={19}
        />
        <input
          name="q"
          type="search"
          placeholder="Municipio o departamento"
          className="min-h-13 w-full rounded-xl border border-[var(--line)] bg-[#fcfbf8] pl-11 pr-4 text-sm text-[var(--ink)] placeholder:text-[#758078]"
        />
      </label>
      <label>
        <span className="sr-only">Tipo de propiedad</span>
        <select
          name="tipo"
          defaultValue=""
          className="min-h-13 w-full rounded-xl border border-[var(--line)] bg-[#fcfbf8] px-4 text-sm text-[var(--ink)]"
        >
          <option value="">Cualquier tipo</option>
          <option value="lote">Lote</option>
          <option value="finca">Finca</option>
          <option value="terreno-rural">Terreno rural</option>
          <option value="terreno-urbano">Terreno urbano</option>
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[var(--earth)] px-6 font-bold text-white transition hover:bg-[#9f5835]"
      >
        <Search aria-hidden="true" size={19} />
        Buscar
      </button>
    </form>
  );
}
