# Changelog

## v1.0.0-alpha.1 — Fase 0: Scaffolding

### Monorepo + Proyecto Web
- Monorepo npm workspaces: `root` + `shared` + `web`
- `shared/`: 10 archivos reutilizados de la app móvil (tipos, constantes, servicios, utils) — **0 cambios necesarios**
- `web/`: Proyecto Vite 8 + React 19 + TypeScript 6
- Tailwind CSS v4 (plugin Vite, sin config file)
- React Router v7 con 6 rutas (Home, Search, Tides, Map, Settings, AlertDetail)
- TanStack Query v5 con QueryClient configurado (retry=1, staleTime=5min)
- Zustand v5 con stores adaptados

### Adaptaciones web
- `cityStore.ts`: MMKV → localStorage (mismo API, prefijo `tiempo-`)
- `useTheme.ts`: `useColorScheme()` de RN → `window.matchMedia("(prefers-color-scheme: dark)")`
- `useLocation.ts`: `expo-location` → `navigator.geolocation` + Open-Meteo Geocoding para reverse geocode

### Hooks web
- `useWeather.ts` — wrapper TanStack Query (stale 10min, gc 30min)
- `useTides.ts` — wrapper TanStack Query + `useCurrentSeaCondition` + `useTideDirection` + `deriveTideForecasts`
- `useAirQuality.ts` — wrapper TanStack Query (stale 30min, gc 60min)
- `useAlerts.ts` — `useAEMETAlerts` + `useLocalAlerts` + `useMergedAlerts`
- `useWeatherLayers.ts` — wrapper TanStack Query para RainViewer
- `useLunarPhase.ts` — cálculo local con `useMemo`
- `useCities.ts` — wrapper Zustand store

### Componentes iniciales
- `ThemeProvider` — contexto React + clase `dark` en `<html>`
- `DynamicBackground` — gradiente CSS dinámico por condición climática (9x2 = 18 gradientes)
- `BottomNavBar` — navegación fija con Lucide icons + React Router NavLink
- `Skeleton` — shimmer CSS con 4 variantes
- `WeatherIcon` — Lucide React con colores por condición

### Rutas (placeholders)
- `Home.tsx` — esqueleto con DynamicBackground + temperatura + condición
- `Search.tsx`, `Tides.tsx`, `Map.tsx`, `Settings.tsx`, `AlertDetail.tsx` — placeholders

### Docker
- `Dockerfile` — multi-stage: node:20-alpine (build) → nginx:alpine (serve)
- `Dockerfile.dev` — dev server con HMR y volúmenes
- `nginx.conf` — SPA fallback, gzip, cache headers (1 año assets)
- `docker-compose.yml` — servicios `app` (prod :8080) y `dev` (dev :3000)

### Limpieza
- Eliminados: `index.html`, `script.js`, `style.css`, `.androidStudio.md`, `EASinfo.md`, `.claude/`, `.idea/`
- Eliminado: `tiempo-app/` completo (código reutilizado en `shared/`)
- Reescrito: `.gitignore` para web + monorepo
