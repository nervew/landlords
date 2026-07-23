# Raíz de Pueblo

Vitrina web demostrativa para explorar lotes, fincas y terrenos en municipios de
Colombia y contactar directamente a inmobiliarias locales ficticias.

## Stack

- Next.js 16 con App Router
- React 19 y TypeScript
- Tailwind CSS 4
- Vitest y Testing Library
- Lucide React

## Ejecutar localmente

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Para generar URLs canónicas con un dominio propio:

```bash
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

También puedes copiar `.env.example` como `.env.local`.

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Rutas

- `/`: inicio y búsqueda principal.
- `/propiedades`: catálogo con filtros y ordenamiento.
- `/propiedades/[slug]`: detalle de cada propiedad.
- `/inmobiliarias/[slug]`: perfil e inventario de cada inmobiliaria.
- `/sitemap.xml` y `/robots.txt`: descubrimiento para buscadores.

## Estructura principal

```text
src/
├── app/                 # Rutas, metadatos, sitemap y robots
├── components/          # Componentes reutilizables
├── data/                # Propiedades e inmobiliarias simuladas
├── lib/                 # Formato, filtros, SEO y WhatsApp
└── types/               # Contratos TypeScript
```

## Alcance y datos

Todos los inmuebles, precios, agencias, teléfonos, correos e indicadores de
contacto son contenido ficticio. La interfaz no certifica tradición, propiedad,
uso del suelo ni estado jurídico. El formulario no almacena ni transmite datos.

Las fotografías rurales proceden de [Pexels](https://www.pexels.com/) y se usan
como material demostrativo. La tarjeta social `public/og.png` fue generada
específicamente para este proyecto.
