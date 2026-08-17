import { getCurrentActor } from "@/lib/auth/actor";
import { listRecentOutbox } from "@/lib/email/outbox";
import { listAgenciesForActor } from "@/lib/repositories/agencies";
import { listInvitations } from "@/lib/repositories/invitations";
import { AccessManagement } from "@/components/panel/access-management";

export default async function AccessPage() {
  const actor = await getCurrentActor();
  if (!actor?.platformAdmin) return null;
  const [agencies, invitations, outbox] = await Promise.all([
    listAgenciesForActor(actor),
    listInvitations(actor),
    listRecentOutbox(40),
  ]);

  return (
    <section>
      <p className="eyebrow">Administración</p>
      <h1 className="mt-3 text-4xl text-[var(--forest)]">Accesos y correo</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Invita miembros sin compartir contraseñas y revisa la entrega transaccional.
      </p>
      <AccessManagement agencies={agencies} invitations={invitations} outbox={outbox} />
    </section>
  );
}

