# Changelog

Todas las mejoras notables del proyecto se documentan en este archivo.

## [Sin publicar]

## Ronda 16 — Rediseño página crypto: ritmo, contenido, indicador BTC
- `.doc-section` ahora se ve como card independiente (padding/border/radius/fondo)
  en vez de texto corrido.
- Separadores `<hr class="section-sep">` reducidos de 17 (uno por sección) a 3,
  reservados solo para transiciones de tipo de contenido real.
- Contenido recortado: glosario inline en `risk-management` simplificado a bullets
  accionables; jerga de `derivatives` (contango/backwardation) en lenguaje más plano.
- Diagrama ASCII (`Precio: \__/‾‾‾\ RSI: \__/__ \`) reemplazado por gráfico SVG real
  (curva de precio + oscilador RSI con umbrales 30/70 etiquetados).
- `CoinTracker.astro`: nuevo prop `featured` (card más grande, borde con glow,
  badge "Indicador principal") aplicado a Bitcoin para que lidere el `tracker-grid`.
- `CoinTracker.astro`: gauge de momentum estático (zonas frío/neutral/caliente),
  marcador posicionado en vivo según el % de cambio 24h ya obtenido — sin llamadas
  nuevas a la API.

## Ronda 15 — Limpieza de repo y footer
- `.gitignore`: entradas para herramientas de IA locales (`.claude/`, `.serena/`,
  `.mcp.json`, `.cursor/`, `.codebase-memory/`).
- Footer: línea de créditos ("Hecho con Vitra CSS + Astro").
- Eliminado script muerto sin uso.

## Ronda 14 — Rework crypto page, navbar, home page, theme variables
- Reestructuración grande de `crypto.astro` (TOC, secciones, tracker grid).
- Ajustes de navbar y home page.
- Nuevas variables de tema compartidas.

## BTC Tracker — iteraciones previas
- Click en icono/nombre/símbolo abre CoinGecko; badge "Live" eliminado; tema oscuro
  reforzado.
- Vuelta a una versión simple y funcional tras probar variantes más complejas.
- Fix de fallback robusto ante fallos de la API de CoinGecko.
- Chart interactivo con selector de rangos (24h, 7d, 30d, 1y) y tema oscuro completo.

## Base del sitio
- Fix de rutas de navegación con prefijo de base path.
- Slider de imágenes con controles de navegación.
- Página 404 y mejoras de routing.
- Workflows de GitHub Actions para build y deploy en GitHub Pages (Astro).
