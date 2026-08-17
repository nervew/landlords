export interface Actor {
  userId: string;
  email: string;
  name: string;
  platformAdmin: boolean;
  agencyIds: string[];
}

export class AuthorizationError extends Error {
  constructor(message = "No tienes permiso para realizar esta acción.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function canAccessAgency(actor: Actor, agencyId: string): boolean {
  return actor.platformAdmin || actor.agencyIds.includes(agencyId);
}

export function assertAgencyAccess(actor: Actor, agencyId: string): void {
  if (!canAccessAgency(actor, agencyId)) {
    throw new AuthorizationError();
  }
}

export function assertPlatformAdmin(actor: Actor): void {
  if (!actor.platformAdmin) {
    throw new AuthorizationError("Esta acción requiere administración de plataforma.");
  }
}
