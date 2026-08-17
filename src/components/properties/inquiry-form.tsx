"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

interface InquiryFormProps {
  propertyTitle: string;
}

const fieldClass =
  "min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm text-[var(--ink)]";

export function InquiryForm({ propertyTitle }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#b9d1c0] bg-[#edf5ef] p-6" role="status">
        <CheckCircle2 aria-hidden="true" className="text-[var(--forest)]" size={28} />
        <h3 className="mt-4 text-2xl text-[var(--forest)]">Solicitud preparada</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Esta es una demostración: no se enviaron datos. En una versión productiva,
          la inmobiliaria recibiría tu mensaje y podría responderte.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 text-sm font-bold text-[var(--earth)] underline underline-offset-4"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (event.currentTarget.checkValidity()) setSubmitted(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
          Nombre
          <input className={fieldClass} name="name" autoComplete="name" required minLength={2} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
          Correo
          <input className={fieldClass} name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Teléfono
        <input className={fieldClass} name="phone" type="tel" autoComplete="tel" required minLength={7} />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[var(--forest)]">
        Mensaje
        <textarea
          className={`${fieldClass} min-h-32 py-3`}
          name="message"
          required
          minLength={10}
          defaultValue={`Hola, quiero recibir más información sobre ${propertyTitle}.`}
        />
      </label>
      <p className="text-xs leading-5 text-[var(--muted)]">
        Formulario demostrativo. Tus datos no se almacenan ni se envían.
      </p>
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--forest)] px-6 font-bold text-white"
      >
        <Send aria-hidden="true" size={18} /> Solicitar información
      </button>
    </form>
  );
}
