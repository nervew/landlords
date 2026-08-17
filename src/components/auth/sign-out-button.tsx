"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.replace("/iniciar-sesion");
        router.refresh();
      }}
      className={`mt-5 w-full rounded-lg px-3 py-2 text-left text-sm font-bold ${
        tone === "dark"
          ? "border border-white/20 text-white/75 hover:bg-white/10"
          : "border border-[#a95346] text-[#7a3027] hover:bg-white/40"
      }`}
    >
      Cerrar sesión
    </button>
  );
}
