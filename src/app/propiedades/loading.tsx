export default function Loading() {
  return (
    <div className="container-shell py-12" role="status" aria-label="Cargando propiedades">
      <span className="sr-only">Cargando propiedades…</span>
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="hidden h-[540px] animate-pulse rounded-2xl bg-[#e7ebe8] lg:block" />
        <div>
          <div className="h-12 animate-pulse rounded-xl bg-[#e7ebe8]" />
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                <div className="aspect-[4/3] animate-pulse bg-[#dde4df]" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#e7ebe8]" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#eef1ef]" />
                  <div className="h-8 w-2/5 animate-pulse rounded bg-[#e7ebe8]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
