# Convención de commits

Usar emoji seguido de Conventional Commits:

```text
<emoji> <type>: <descripción>
```

- Descripción imperativa o en presente, en minúsculas y sin punto final.
- Asunto menor a 72 caracteres.
- Un cambio lógico por commit.

| Tipo | Emoji | Uso |
|---|---|---|
| `feat` | ✨ | Funcionalidad |
| `fix` | 🐛 | Corrección |
| `docs` | 📚 | Documentación |
| `style` | 💅 | Formato sin cambio lógico |
| `refactor` | ♻️ | Mejora interna |
| `perf` | ⚡ | Rendimiento |
| `test` | 🧪 | Pruebas |
| `build` | 🏗️ | Build o dependencias |
| `ci` | 🔄 | Integración continua |
| `chore` | 🔧 | Mantenimiento |
| `revert` | ⏪ | Reversión |
| `security` | 🔐 | Seguridad |

Los commits de NORTH usan el scope `north`, por ejemplo:
`📚 docs(north): inicializa memoria del proyecto`.
