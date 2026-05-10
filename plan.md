# Tiempo — Web

## Stack Tecnológico

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Framework | **Vite 8** + **React 19** | Build ultra-rápido, HMR instantáneo |
| Lenguaje | **TypeScript 6** | Tipado estricto, compartido con app móvil |
| Navegación | **React Router v7** | SPA con lazy-load |
| Estilo | **Tailwind CSS v4** | Utility-first, mismo paradigma que NativeWind |
| Estado | **Zustand** + **TanStack Query v5** | Cache inteligente de API, estado mínimo |
| Iconos | **Lucide React** | Mismos iconos que la app móvil |
| Mapa | **Leaflet** directo en DOM | Interactivo nativo, 5 capas meteorológicas |
| Animaciones | **CSS** (keyframes, transitions) | Sin overhead, 60fps nativos |
| Almacenamiento | **localStorage** | Persistencia simple para ciudades y ajustes |
| Deploy | **Docker** + **nginx** | Multi-stage build, SPA serving |

## APIs Externas

| API | Datos | Coste |
|-----|-------|-------|
| **Open-Meteo** | Previsión global, marine, calidad del aire | Gratuito, sin key |
| **Open-Meteo Geocoding** | Búsqueda de ciudades | Gratuito |
| **RainViewer** | Radar de precipitación, satélite infrarrojo | Gratuito |
| **AEMET** | Alertas oficiales España (CAP XML) | Gratuito con key |
| **OpenWeatherMap** | Tiles de temperatura, viento, presión | Gratuito con key |

## Modo Claro/Oscuro

- Detección automática del sistema (`window.matchMedia`)
- Override manual en Ajustes (sistema / claro / oscuro)
- Fondos degradados duales por condición climática (9 condiciones x 2 modos = 18 gradientes)
- Cards glassmorphism con `backdrop-filter: blur()`
- Texto adaptativo: `slate-800` sobre claro, `slate-100` sobre oscuro
- Transiciones CSS suaves entre modos (700ms)

## Estructura de Carpetas

```
shared/                    # Código compartido con app móvil (0 deps React Native)
├── types/weather.ts       # Tipos TypeScript
├── constants/
│   ├── theme.ts           # Gradientes, colores por condición + modo
│   ├── weather.ts         # Mapeo WMO → condiciones, descripciones
│   └── aemetZones.ts      # Zonas AEMET, subzonas
├── services/
│   ├── openmeteo.ts       # getWeather, searchCities, getMarineWeather, getAirQuality
│   ├── aemet.ts           # getAEMETAlerts (CAP XML parsing)
│   ├── weatherLayers.ts   # RainViewer + OWM tiles
│   └── alerts.ts          # generateAlerts (umbrales locales)
└── utils/
    ├── lunar.ts           # calculateMoonPhase, calculateMoonTimes
    └── coastal.ts         # isCoastalCity, haversine

web/                       # App web Vite + React
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Root providers + Router
│   ├── routes/            # Páginas (React Router)
│   │   ├── Home.tsx       # Clima principal
│   │   ├── Search.tsx     # Búsqueda ciudades
│   │   ├── Tides.tsx      # Mareas
│   │   ├── Map.tsx        # Mapa meteorológico
│   │   ├── Settings.tsx   # Ajustes
│   │   └── AlertDetail.tsx # Detalle de alerta
│   ├── components/
│   │   ├── weather/       # CurrentWeather, HourlyForecast, DailyForecast, etc.
│   │   ├── tides/         # TideChart, TideTable, SeaConditionCard
│   │   ├── map/           # WeatherMap (Leaflet), LayerSelector, RadarTimeline
│   │   ├── alerts/        # AlertBanner, AlertList
│   │   ├── theme/         # ThemeProvider, DynamicBackground
│   │   ├── city/          # CitySelector
│   │   └── ui/            # BottomNavBar, Skeleton
│   ├── hooks/             # Adaptados de shared/ + web-specific
│   │   ├── useWeather.ts
│   │   ├── useTides.ts
│   │   ├── useAirQuality.ts
│   │   ├── useAlerts.ts
│   │   ├── useWeatherLayers.ts
│   │   ├── useCities.ts
│   │   ├── useTheme.ts        # window.matchMedia
│   │   ├── useLocation.ts     # navigator.geolocation
│   │   └── useLunarPhase.ts
│   ├── stores/
│   │   └── cityStore.ts   # Zustand + localStorage (adaptado de MMKV)
│   └── index.css          # Tailwind base + animaciones custom
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json

docker/
├── Dockerfile             # Multi-stage: build Vite → nginx
├── Dockerfile.dev         # Dev server con HMR
├── nginx.conf             # SPA fallback, gzip, cache
└── docker-compose.yml     # Producción + desarrollo
```

## Fases de Implementación

### Fase 0 — Scaffolding ✅
- [x] Monorepo npm workspaces (root + shared + web)
- [x] Proyecto Vite + React 19 + TypeScript
- [x] Tailwind CSS v4 configurado (plugin Vite)
- [x] React Router v7 con 6 rutas
- [x] TanStack Query v5 + Zustand instalados
- [x] Lucide React + Leaflet instalados
- [x] `shared/` con 10 archivos reutilizados de app móvil (0 cambios)
- [x] `cityStore.ts` adaptado: MMKV → localStorage
- [x] `useTheme.ts` adaptado: useColorScheme → window.matchMedia
- [x] `useLocation.ts` reescrito: expo-location → navigator.geolocation
- [x] Hooks web: useWeather, useTides, useAirQuality, useAlerts, useWeatherLayers, useLunarPhase
- [x] ThemeProvider + DynamicBackground
- [x] BottomNavBar responsive
- [x] Skeleton loaders (shimmer CSS)
- [x] WeatherIcon (Lucide React con colores)
- [x] Docker: Dockerfile (prod), Dockerfile.dev, nginx.conf, docker-compose.yml
- [x] .gitignore reescrito para web + monorepo
- [x] Archivos root viejos eliminados (index.html, script.js, style.css, .androidStudio.md, EASinfo.md, .claude/, .idea/)
- [x] tiempo-app/ eliminado (código movido a shared/)

### Fase 1 — Core: Clima Actual + 7 días
- [ ] Componente `CurrentWeather` (temp, sensación, condición, H/L)
- [ ] Componente `HourlyForecast` (scroll horizontal 24h)
- [ ] Componente `PrecipitationChart` (SVG área/curva Bezier 24h)
- [ ] Componente `DailyForecast` (7 días colapsable: 4+3)
- [ ] Componente `WeatherDetails` (6 tiles: sensación, humedad, viento, UV, presión, visibilidad)
- [ ] Ruta `Home.tsx` completa con fondo degradado dinámico
- [ ] Skeleton loaders específicos por sección

### Fase 2 — Gestión de Ciudades
- [ ] Componente `CitySelector` (modal)
- [ ] Ruta `Search.tsx` con autocompletado + debounce + AbortController
- [ ] Geolocalización web (navigator.geolocation + reverse geocoding)
- [ ] Store de ciudades (localStorage)
- [ ] Eliminar ciudades con confirmación

### Fase 3 — Mareas
- [ ] Componente `TideChart` (SVG nativo, curva Bezier 24h)
- [ ] Componente `TideTable` (7 días)
- [ ] Componente `SeaConditionCard` (estado del mar)
- [ ] Componente `TideTimesCard` (pleamar/bajamar)
- [ ] Detección de ciudad costera (`isCoastalCity` de shared/)
- [ ] Ruta `Tides.tsx` completa
- [ ] Placeholder "ciudad interior"

### Fase 4 — Alertas
- [ ] Componente `AlertBanner` (color por severidad, dismiss)
- [ ] Componente `AlertList` + `AlertRow`
- [ ] Ruta `AlertDetail.tsx` (título, descripción, horarios, severidad)
- [ ] Integración AEMET (servicio directo de shared/)
- [ ] Merge AEMET + alertas locales (`useMergedAlerts`)
- [ ] Alertas en Home debajo de ciudad

### Fase 5 — Mapa Interactivo
- [ ] Componente `WeatherMap` con Leaflet directo en DOM
- [ ] CartoDB tiles (light_all / dark_all)
- [ ] 5 capas: RainViewer, satélite, temperatura, viento, presión
- [ ] Componente `LayerSelector` (botones horizontales)
- [ ] Marcadores de ciudades guardadas
- [ ] Radar timeline (play/pause/scrub) — Leaflet nativo
- [ ] API Key OWM configurable
- [ ] Ruta `Map.tsx` completa

### Fase 6 — Calidad del Aire + Fase Lunar
- [ ] Componente `AirQualityCard` (EAQI + barra de progreso + detalle expandible)
- [ ] Componente `LunarPhaseCard` (8 SVGs nativos, moonrise/moonset, sunrise/sunset)
- [ ] Integración en Home

### Fase 7 — Animaciones + Tema
- [ ] `WeatherParticles` (CSS keyframes: lluvia, tormenta, nieve, niebla, nubes, destellos, rayos)
- [ ] Glassmorphism cards (`backdrop-filter: blur()`)
- [ ] Transiciones suaves entre modos (CSS transitions)
- [ ] Responsive design completo (mobile-first, sidebar desktop en md+)

### Fase 8 — Ajustes
- [ ] Ruta `Settings.tsx` completa
- [ ] Tema (sistema / claro / oscuro)
- [ ] Unidades (°C/°F, kmh/mph/ms/knots)
- [ ] Gestión de ciudades (lista, eliminar)
- [ ] API Keys (OWM + AEMET) con validación
- [ ] Iconos (coloreados / monocromo)

### Fase 9 — Navegación + Layout
- [ ] Layout principal responsive (bottom nav mobile / sidebar desktop)
- [ ] React Router con lazy loading por ruta
- [ ] Favicon + meta tags OG
- [ ] Transiciones de página

### Fase 10 — Docker + Deploy
- [ ] Verificar Dockerfile multi-stage (build → nginx)
- [ ] Verificar nginx.conf (SPA fallback, gzip, cache)
- [ ] Variables de entorno para API keys por defecto
- [ ] Healthcheck endpoint funcional
- [ ] Docker Compose producción funcional

## Principios de Diseño (estilo Apple Weather)

- **Fondo dinámico**: Gradiente que cambia según condición + modo (claro/oscuro)
- **Tipografía grande**: Temps en font-size 72px+, peso light
- **Cards glassmorphism**: `backdrop-filter: blur()` + fondo semitransparente
- **Scroll vertical único**: Todo en una columna, sin tabs
- **Animaciones CSS**: Transiciones suaves, partículas con keyframes
- **Zero bordes**: Esquinas redondeadas, sin líneas separadoras
- **Mobile-first**: Diseño optimizado para móvil, adaptado a desktop

## Paleta de Gradientes por Condición

### Modo Claro
| Condición | Gradiente |
|-----------|-----------|
| Soleado | `#7DD3FC` → `#FDBA74` |
| Parcialmente nublado | `#BAE6FD` → `#E0F2FE` |
| Nublado | `#E2E8F0` → `#CBD5E0` |
| Lluvia | `#93C5FD` → `#BFDBFE` |
| Tormenta | `#94A3B8` → `#CBD5E0` |
| Nieve | `#F1F5F9` → `#E2E8F0` |
| Niebla | `#D1D5DB` → `#E5E7EB` |
| Noche despejada | `#E2E8F0` → `#CBD5E0` |
| Noche nublada | `#CBD5E0` → `#A0AEC0` |

### Modo Oscuro
| Condición | Gradiente |
|-----------|-----------|
| Soleado | `#0F172A` → `#1E293B` |
| Parcialmente nublado | `#0F172A` → `#334155` |
| Nublado | `#1E293B` → `#334155` |
| Lluvia | `#0F172A` → `#1E1E2C` |
| Tormenta | `#080C14` → `#1E293B` |
| Nieve | `#1E293B` → `#475569` |
| Niebla | `#1E293B` → `#334155` |
| Noche despejada | `#020617` → `#0F172A` |
| Noche nublada | `#0F172A` → `#1E293B` |

## Estrategia de Rendimiento

- **Vite HMR**: Desarrollo instantáneo
- **Code splitting**: Lazy loading por ruta (React.lazy + Suspense)
- **TanStack Query**: stale-while-revalidate, cache inteligente
- **Tailwind CSS v4**: Solo CSS usado en producción
- **nginx gzip**: Compresión de assets estáticos
- **Cache headers**: 1 año para assets con hash, no-cache para HTML
- **Preconnect**: APIs Open-Meteo en `<link rel="preconnect">`

## Orden de Ejecución

1. **Fase 0**: Scaffolding + monorepo ✅
2. **Fase 1**: Clima actual + 7 días
3. **Fase 2**: Gestión de ciudades
4. **Fase 3**: Mareas
5. **Fase 4**: Alertas AEMET
6. **Fase 5**: Mapa interactivo
7. **Fase 6**: AQI + Fase Lunar
8. **Fase 7**: Animaciones + Tema
9. **Fase 8**: Ajustes
10. **Fase 9**: Navegación + Layout
11. **Fase 10**: Docker + Deploy
