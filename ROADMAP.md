# Roadmap

## Hecho

- [x] Página crypto: estructura TOC, tracker grid, contenido educativo (Ronda 14)
- [x] Limpieza de repo, gitignore de tooling de IA, footer con créditos (Ronda 15)
- [x] Ritmo de secciones tipo card, separadores reducidos a lo esencial (Ronda 16)
- [x] Contenido recortado y simplificado en risk-management/derivatives (Ronda 16)
- [x] Diagrama ASCII reemplazado por SVG real de precio + RSI (Ronda 16)
- [x] BTC tracker como centerpiece: prop `featured`, gauge de momentum estático (Ronda 16)

## Pendiente / próximas iteraciones

- [ ] Revisar el resto de páginas (git, python, java, cpp) con el mismo criterio de
      ritmo/contraste aplicado a crypto — confirmar si tienen el mismo problema de
      "mucho contraste" entre secciones.
- [ ] Evaluar si el gauge de momentum debería usar RSI real (requiere histórico de
      precio, no solo % 24h) en vez del proxy actual.
- [ ] Revisión de accesibilidad (contraste de color, aria-labels) en los nuevos
      elementos SVG y gauge.
- [ ] Decidir agrupación de commits pendientes con el usuario antes de cambios futuros
      de gran alcance (ya no aplica a Ronda 16, que se pusheó de forma independiente).

## Contexto de planeación — Ronda 16 (referencia histórica)

Plan aprobado y ejecutado en esta ronda, documentado aquí como registro de decisiones:

**Problema reportado por el usuario:** la página crypto contrastaba mal con el resto
del sitio en espaciado/seccionado/padding-margins; había contenido genérico, un
diagrama ASCII mal hecho, y el tracker de BTC (la pieza central de la página) carecía
de un estilo de indicador que lo hiciera destacar.

**Decisión de diseño clave:** no copiar literalmente el patrón `.content-section`/
`.section-inner` de la home page sobre crypto.astro — son tipos de página distintos
(home es card-rhythm marketing; crypto es doc de contenido largo con TOC ancla). Se
tomaron los *principios* (aire, jerarquía, dividers discretos, un foco visual fuerte)
y se aplicaron al idioma propio de `.doc-section`, respetando las dependencias de
`crypto-toc.js` (IntersectionObserver sobre `.doc-section[id]` y su `scroll-margin-top`).

**Alcance ejecutado:**
1. Ritmo de secciones y dividers (`crypto.css`, `crypto.astro`)
2. Pase de contenido (recortes + diagrama SVG)
3. Rediseño del BTC tracker (`CoinTracker.astro`) — prop `featured` + gauge
4. Ajustes mobile de rondas previas se mantuvieron sin tocar

**Verificación:** `npm run build` limpio, preview local, conteo de `doc-section`
(11) y `section-sep` (3) confirmado en el HTML generado, badge/gauge featured
confirmados en el output estático.
