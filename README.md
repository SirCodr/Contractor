# Contractor — Generador de Contratos de Arrendamiento

> Aplicación web para generar contratos de arrendamiento de vivienda urbana legalmente válidos bajo la legislación colombiana (Ley 820 de 2003), con integración nativa a Google Drive y Google Docs.

---

## ¿Qué hace?

**Contractor** permite a arrendadores colombianos crear contratos de arrendamiento listos para firmar, de forma guiada y sin conocimientos jurídicos. La aplicación abstrae las reglas legales obligatorias y genera el documento final directamente en Google Drive del usuario.

### Funcionalidades principales

- 🧙 **Wizard paso a paso** — Captura partes, inmueble, condiciones económicas y cláusulas de forma estructurada
- 📄 **Generación de Google Docs** — El contrato se crea automáticamente en el Drive del usuario con formato profesional (fuente, interlineado, justificado)
- 🏠 **Modo plantilla** — Permite guardar un contrato base sin arrendatario para reutilizarlo después
- ✏️ **Edición de contratos existentes** — Abre y modifica contratos guardados en Drive
- ⚖️ **Cláusulas configurables** — Las cláusulas opcionales pueden activarse o desactivarse; las obligatorias (Ley 820) no pueden eliminarse
- 📐 **Validaciones legales automáticas** — Canon, fechas, co-deudor y datos requeridos validados por Zod
- 🔐 **Autenticación con Google** — Login seguro via OAuth 2.0 con NextAuth.js

---

## Stack tecnológico

| Área | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Autenticación | NextAuth.js v5 + Google OAuth |
| Formularios | React Hook Form + Zod |
| Estado global | Zustand |
| Fetching | TanStack Query |
| UI | shadcn/ui + Tailwind CSS v4 |
| Integración | Google Drive API + Google Docs API |
| Despliegue | Vercel |

---

## Estructura del proyecto

```
app/
  (dashboard)/         # Rutas protegidas: contratos, inmuebles, plantillas
  actions/             # Server Actions (Drive, autenticación)
  api/                 # Endpoints REST internos
components/
  builder/             # Wizard de creación: pasos + preview
  ui/                  # Componentes genéricos (shadcn)
constants/             # Cláusulas base del contrato
lib/
  markdown-generator   # Construye el texto del contrato desde los datos del formulario
  template-engine      # Motor de variables y bloques condicionales {{#key}}
  google-docs          # Helpers para crear/actualizar Google Docs
  google-drive         # Helpers para carpetas, metadata y archivos en Drive
stores/                # Zustand store del wizard (builder-store)
types/                 # Tipos TypeScript del dominio
```

---

## Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/contrato-generador.git
cd contrato-generador
npm install
```

### 2. Variables de entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# NextAuth
NEXTAUTH_SECRET=XXXXXX XXXXXX
NEXTAUTH_URL=XXXXXX XXXXXX

# Google OAuth (Google Cloud Console)
GOOGLE_CLIENT_ID=XXXXXX XXXXXX
GOOGLE_CLIENT_SECRET=XXXXXX XXXXXX
```

> Las credenciales de Google se obtienen en [Google Cloud Console](https://console.cloud.google.com) habilitando las APIs de **Google Drive** y **Google Docs**, y configurando un cliente OAuth con el scope `drive.file`.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Accede en [http://localhost:3000](http://localhost:3000).

---

## Despliegue

El proyecto está configurado para desplegarse en **Vercel** con integración continua desde GitHub. Agrega las mismas variables de entorno en el panel de Vercel.

```bash
vercel deploy
```

---

## Marco legal

Los contratos generados por esta aplicación están estructurados conforme a:

- **Ley 820 de 2003** — Estatuto del arrendamiento de vivienda urbana en Colombia
- **Decreto 3130 de 2003** — Reglamentario de la Ley 820
- Las cláusulas obligatorias no pueden desactivarse desde la interfaz

> ⚠️ Esta herramienta es una ayuda para la redacción de contratos. No reemplaza el asesoramiento jurídico profesional.

---

## Licencia

MIT © 2025
