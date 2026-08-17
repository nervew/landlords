import {
  changeAgencyStatusAction,
  moderatePropertyAction,
} from "./actions";
import { getCurrentActor } from "@/lib/auth/actor";
import { listAgenciesForActor } from "@/lib/repositories/agencies";
import {
  listModerationQueue,
  listRecentAuditEvents,
} from "@/lib/repositories/moderation";

export default async function ModerationPage() {
  const actor = await getCurrentActor();
  if (!actor?.platformAdmin) return null;
  const [agencies, queue, events] = await Promise.all([
    listAgenciesForActor(actor),
    listModerationQueue(actor),
    listRecentAuditEvents(actor, 20),
  ]);

  return (
    <section>
      <p className="eyebrow">Administración</p>
      <h1 className="mt-3 text-4xl text-[var(--forest)]">Moderación y confianza</h1>

      <section className="mt-10">
        <h2 className="text-2xl text-[var(--forest)]">Inmobiliarias</h2>
        <div className="mt-5 grid gap-3">
          {agencies.map((agency) => (
            <article key={agency.id} className="rounded-xl border border-[var(--line)] bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-sans text-base font-extrabold text-[var(--forest)]">
                    {agency.name}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Estado actual: {agency.status}
                  </p>
                </div>
                <form action={changeAgencyStatusAction} className="flex gap-2">
                  <input type="hidden" name="agencyId" value={agency.id} />
                  <select
                    name="status"
                    defaultValue={agency.status}
                    className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="verified">Verificada</option>
                    <option value="suspended">Suspendida</option>
                  </select>
                  <button className="rounded-lg bg-[var(--forest)] px-4 text-sm font-bold text-white">
                    Aplicar
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <h2 className="text-2xl text-[var(--forest)]">Propiedades pendientes</h2>
        <div className="mt-5 grid gap-4">
          {queue.map((item) => (
            <article key={item.id} className="rounded-xl border border-[var(--line)] bg-white p-5">
              <h3 className="font-sans text-base font-extrabold text-[var(--forest)]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {item.agencyName} · {item.municipality}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <form action={moderatePropertyAction}>
                  <input type="hidden" name="propertyId" value={item.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button className="min-h-11 w-full rounded-lg bg-[#26734c] px-4 text-sm font-bold text-white">
                    Aprobar y publicar
                  </button>
                </form>
                <form action={moderatePropertyAction} className="grid gap-2">
                  <input type="hidden" name="propertyId" value={item.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <input
                    name="reason"
                    required
                    minLength={10}
                    placeholder="Razón del rechazo"
                    className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm"
                  />
                  <button className="min-h-11 rounded-lg border border-[#a95346] px-4 text-sm font-bold text-[#8b3f36]">
                    Rechazar
                  </button>
                </form>
              </div>
            </article>
          ))}
          {!queue.length && (
            <p className="rounded-xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
              No hay propiedades pendientes.
            </p>
          )}
        </div>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-10">
        <h2 className="text-2xl text-[var(--forest)]">Auditoría reciente</h2>
        <ol className="mt-5 grid gap-2">
          {events.map((event) => (
            <li key={event.id} className="rounded-lg bg-white px-4 py-3 text-sm">
              <strong>{event.action}</strong>
              <span className="ml-2 text-[var(--muted)]">
                {event.entityType} · {event.entityId} ·{" "}
                {new Intl.DateTimeFormat("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(event.createdAt))}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
