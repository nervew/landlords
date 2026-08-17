"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Property } from "@/types";
import { filterProperties, filtersFromSearchParams } from "@/lib/property-filters";
import { PropertyCard } from "./property-card";
import { CatalogFilters } from "./catalog-filters";

export function CatalogClient({ properties }: { properties: Property[] }) {
  const departments = useMemo(
    () => [...new Set(properties.map((property) => property.department))].sort(),
    [properties],
  );
  const municipalities = useMemo(
    () => [...new Set(properties.map((property) => property.municipality))].sort(),
    [properties],
  );
  const uses = useMemo(
    () => [...new Set(properties.flatMap((property) => property.intendedUse))].sort(),
    [properties],
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const results = useMemo(
    () => filterProperties([...properties], filters),
    [filters, properties],
  );

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    startTransition(() => {
      router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    });
  }

  function clearFilters() {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  return (
    <div className="container-shell py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-[var(--line)] bg-white p-5">
            <CatalogFilters
              filters={filters}
              departments={departments}
              municipalities={municipalities}
              uses={uses}
              onChange={updateParam}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <section aria-labelledby="resultados-title">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <form
              key={filters.query}
              className="grid grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                updateParam("q", String(data.get("q") ?? ""));
              }}
              role="search"
            >
              <label className="relative">
                <span className="sr-only">Buscar en el catálogo</span>
                <Search
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--earth)]"
                  size={19}
                />
                <input
                  name="q"
                  type="search"
                  defaultValue={filters.query}
                  placeholder="Buscar por municipio, departamento o palabra"
                  className="min-h-12 w-full rounded-l-xl border border-r-0 border-[var(--line)] bg-white pl-11 pr-4 text-sm"
                />
              </label>
              <button
                type="submit"
                className="min-h-12 rounded-r-xl bg-[var(--forest)] px-5 text-sm font-bold text-white"
              >
                Buscar
              </button>
            </form>
            <label>
              <span className="sr-only">Ordenar propiedades</span>
              <select
                value={filters.sort}
                onChange={(event) => updateParam("orden", event.target.value)}
                className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm sm:w-auto"
              >
                <option value="relevance">Más relevantes</option>
                <option value="newest">Más recientes</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </label>
          </div>

          <details className="mt-4 rounded-xl border border-[var(--line)] bg-white lg:hidden">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between px-4 font-bold text-[var(--forest)]">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal aria-hidden="true" size={18} /> Filtros
              </span>
            </summary>
            <div className="border-t border-[var(--line)] p-4">
              <CatalogFilters
                filters={filters}
                departments={departments}
                municipalities={municipalities}
                uses={uses}
                onChange={updateParam}
                onClear={clearFilters}
              />
            </div>
          </details>

          <div className="mt-7 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Catálogo demostrativo</p>
              <h2 id="resultados-title" className="mt-1 font-sans text-xl font-extrabold text-[var(--forest)]">
                {results.length} {results.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
              </h2>
            </div>
            {isPending && (
              <span role="status" className="text-sm text-[var(--muted)]">
                Actualizando…
              </span>
            )}
          </div>

          {results.length > 0 ? (
            <div
              className={`mt-7 grid gap-6 md:grid-cols-2 ${isPending ? "opacity-60" : ""}`}
              aria-busy={isPending}
            >
              {results.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="mt-7 grid min-h-80 place-items-center rounded-2xl border border-dashed border-[#bbc8bf] bg-white p-8 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#edf2ee] text-[var(--forest)]">
                  <X aria-hidden="true" size={24} />
                </span>
                <h3 className="mt-5 text-2xl text-[var(--forest)]">No encontramos coincidencias</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Prueba otro municipio, amplía el rango o limpia los filtros para
                  volver a ver todas las propiedades.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 min-h-11 rounded-full bg-[var(--forest)] px-6 font-bold text-white"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
