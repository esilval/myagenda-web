# MyAgenda Web (Frontend)

Proyecto Angular generado con [Angular CLI](https://angular.dev/tools/cli) (v20). Incluye routing, estilos SCSS y SSR habilitado.

## Requisitos

- Node.js 20+ y npm
- Angular CLI (opcional): `npm i -g @angular/cli`

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm start
# Abre: http://localhost:4200/
```

Recarga en caliente activada. Los cambios en `src/` se reflejan automáticamente.

## Build de producción

```bash
npm run build
# Salida: dist/myagenda-web
```

Para previsualizar SSR tras el build:

```bash
npm run serve:ssr:myagenda-web
# Abre: http://localhost:4000/
```

## Estructura básica

- `src/app/app.routes.ts`: rutas de la app (Home por defecto)
- `src/app/pages/home/`: componente de inicio
- `src/styles.scss`: estilos globales

## Scaffolding (generadores)

```bash
ng g c pages/mi-componente --inline-style --inline-template
ng g s core/mi-servicio
ng g guard core/auth
```

## Scripts útiles

- `npm start`: servidor de desarrollo
- `npm run build`: build de producción (+ SSR)
- `npm test`: unit tests (Karma)

## Siguientes pasos sugeridos

- Configurar variables de entorno para endpoints de API (por ejemplo, `environment.ts`).
- Añadir layout base y módulo de autenticación.
- Integrar CORS con el backend ya configurado.

## Licencia

Uso interno del proyecto MyAgenda.
