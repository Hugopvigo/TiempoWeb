# Tiempo — El clima nunca se vio tan bien

[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Tiempo** es una aplicación meteorológica web inspirada en Apple Weather. Combina datos oficiales de la **AEMET** para España con la cobertura global de **Open-Meteo**, todo con una estética minimalista de fondos degradados dinámicos y glassmorphism.

**Producción:** [https://tiempo.hugopvigo.es](https://tiempo.hugopvigo.es)

---

## Características

- **Previsión detallada**: Tiempo actual, por horas (24h), a 7 días (colapsable) y gráfico de probabilidad de lluvia SVG
- **Calidad del Aire**: Índice EAQI europeo con detalle expandible (PM2.5, PM10, O3, NO2)
- **Fase Lunar**: 8 fases con SVGs custom, iluminación %, orto/ocaso lunar y amanecer/atardecer
- **Mareas**: Gráficos SVG sinusoidales, detección automática de ciudades costeras, horarios de pleamar/bajamar
- **Alertas oficiales**: Integración directa con AEMET (CAP XML). Merge inteligente con alertas locales sin duplicados
- **Mapa interactivo**: 5 capas — radar RainViewer, satélite, temperatura, viento y presión vía OWM. Leaflet nativo en DOM
- **Diseño adaptativo**: Mobile-first, fondos degradados dinámicos por condición climática, glassmorphism con backdrop-filter
- **Gestión de ciudades**: Búsqueda con autocompletado, geolocalización, localStorage persistente
- **Modo claro/oscuro**: Detección automática del sistema con override manual
- **Claves API configurables**: OWM y AEMET desde ajustes, sin recompilar

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Core** | Vite 8 + React 19 + TypeScript 6 |
| **Navegación** | React Router v7 |
| **Estilos** | Tailwind CSS v4 |
| **Estado** | Zustand + TanStack Query v5 |
| **Iconos** | Lucide React |
| **Mapas** | Leaflet + RainViewer + OpenWeatherMap |
| **Deploy** | Docker + nginx |

---

## Estructura del Proyecto

```text
shared/               # Código compartido (0 deps React Native)
├── types/            # Tipos TypeScript
├── constants/        # Gradientes, colores, mapeos WMO, zonas AEMET
├── services/         # API clients (Open-Meteo, AEMET, RainViewer, OWM)
└── utils/            # Lunar, coastal detection

web/                  # App web Vite + React
├── src/
│   ├── routes/       # Páginas (Home, Search, Tides, Map, Settings, AlertDetail)
│   ├── components/   # UI atómica (weather, tides, map, alerts, theme, city, ui)
│   ├── hooks/        # Hooks adaptados + web-specific
│   └── stores/       # Zustand + localStorage
└── docker/           # Dockerfile, nginx.conf, docker-compose
```

---

## APIs Utilizadas

| API | Uso | Requiere Key |
|-----|-----|-------------|
| **Open-Meteo** | Previsión global, marine, calidad del aire | No |
| **Open-Meteo Geocoding** | Búsqueda de ciudades | No |
| **RainViewer** | Radar de precipitación, satélite infrarrojo | No |
| **AEMET** | Alertas oficiales España | Sí (Ajustes) |
| **OpenWeatherMap** | Tiles de temperatura, viento, presión | Sí (Ajustes) |

---

## Desarrollo

```bash
# Clonar
git clone https://github.com/tu-usuario/tiempo-web.git
cd tiempo-web

# Instalar dependencias
npm install

# Arrancar dev server (http://localhost:3000)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

### Docker

```bash
# Producción (http://localhost:8080)
docker compose -f docker/docker-compose.yml up app

# Desarrollo con HMR (http://localhost:3000)
docker compose -f docker/docker-compose.yml up dev
```

---

## Fases de Desarrollo

- [x] **Fase 0:** Scaffolding, monorepo, código compartido, Docker
- [x] **Fase 1:** Core — previsión actual + 7 días
- [x] **Fase 2:** Gestión de ciudades
- [x] **Fase 3:** Mareas
- [x] **Fase 4:** Alertas AEMET
- [x] **Fase 5:** Mapa interactivo
- [x] **Fase 6:** Calidad del Aire + Fase Lunar
- [x] **Fase 7:** Animaciones + Tema
- [x] **Fase 8:** Ajustes
- [x] **Fase 9:** Navegación + Layout
- [x] **Fase 10:** Docker + Deploy

---

## Despliegue en Producción

La aplicación está desplegada en un servidor Oracle Cloud ARM (Ampere) usando Docker para el contenedor de la app y Apache2 como reverse proxy en frente. El SSL termina en Cloudflare. Adaptalo a tu VPS.

```text
Cloudflare (proxy + SSL)
    ↓
Apache2 (443/80) → ProxyPass → Docker container (127.0.0.1:8080) → nginx + SPA build
```

Configuración del VirtualHost de Apache para `tiempo.hugopvigo.es`:

```apache
<VirtualHost *:443>
    ServerName tiempo.hugopvigo.es
    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/cloudflare.pem
    SSLCertificateKeyFile /etc/apache2/ssl/cloudflare-key.pem

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8080/
    ProxyPassReverse / http://127.0.0.1:8080/
</VirtualHost>
```

El contenedor se construye con las API keys inyectadas en build time vía `.env`:

```bash
cd docker
docker compose up -d app --build
```

---

## Licencia

MIT — consulta [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado por [Hugo Perez-Vigo](https://hugopvigo.es)** · [@hugopvigo](https://x.com/hugopvigo)

[![GitHub](https://img.shields.io/badge/GitHub-Hugopvigo-181717?style=for-the-badge&logo=github)](https://github.com/Hugopvigo)

</div>
