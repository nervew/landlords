import type { Agency } from "@/types";

export const agencies: Agency[] = [
  {
    id: "ag-boyaca-raiz",
    name: "Boyacá Raíz Inmobiliaria",
    slug: "boyaca-raiz-inmobiliaria",
    logo: "BR",
    description:
      "Equipo local enfocado en lotes campestres y fincas de vocación productiva en el corredor de Villa de Leyva.",
    department: "Boyacá",
    municipality: "Villa de Leyva",
    phone: "+57 310 555 0182",
    whatsapp: "573105550182",
    email: "hola@boyacaraiz.demo",
    verified: true,
  },
  {
    id: "ag-tierra-cafetera",
    name: "Tierra Cafetera",
    slug: "tierra-cafetera",
    logo: "TC",
    description:
      "Inmobiliaria demostrativa con conocimiento de fincas, lotes y proyectos rurales del paisaje cafetero.",
    department: "Quindío",
    municipality: "Salento",
    phone: "+57 315 555 0274",
    whatsapp: "573155550274",
    email: "contacto@tierracafetera.demo",
    verified: true,
  },
  {
    id: "ag-horizonte-rural",
    name: "Horizonte Rural",
    slug: "horizonte-rural",
    logo: "HR",
    description:
      "Acompañamiento cercano para descubrir terrenos con potencial turístico, residencial y agropecuario.",
    department: "Antioquia",
    municipality: "Jericó",
    phone: "+57 300 555 0368",
    whatsapp: "573005550368",
    email: "asesoria@horizonterural.demo",
    verified: false,
  },
];

export function getAgencyById(id: string) {
  return agencies.find((agency) => agency.id === id);
}

export function getAgencyBySlug(slug: string) {
  return agencies.find((agency) => agency.slug === slug);
}
