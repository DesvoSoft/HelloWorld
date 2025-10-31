# Crypto TOC Quick Guide

## Cómo probar
1. Abre `src/pages/crypto.html` en un navegador de escritorio y móvil (usar DevTools responsive) y comprueba:
   - El botón "Ocultar índice" fija la tarjeta en escritorio y abre/cierra el panel en móvil.
   - Navega con teclado (Tab, Shift+Tab, Enter/Espacio) y verifica foco visible en enlaces y toggles.
   - El índice se colapsa automáticamente al hacer scroll hacia abajo y se expande al volver arriba.
   - Los enlaces desplazan la página respetando `scroll-margin` de las secciones.
2. Recarga la página y confirma que el estado manual del índice persiste (localStorage `crypto.toc.state`).
3. Ejecuta Lighthouse y axe DevTools en la vista de escritorio para validar accesibilidad (sin avisos de contraste ni de botones sin etiqueta).

## Integración de analytics
Los eventos del componente se emiten como `CustomEvent` burbujeados. Ejemplo con `dataLayer` o `analytics.track`:

```js
const toc = document.querySelector('nav.toc[data-toc-scope="crypto"]');
if (toc) {
  toc.addEventListener('toc:toggle', (event) => {
    const { collapsed, source } = event.detail;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'toc_toggle',
      toc_state: collapsed ? 'collapsed' : 'expanded',
      toc_source: source,
    });
  });

  toc.addEventListener('toc:click', (event) => {
    const { id, href } = event.detail;
    analytics.track('toc_link_click', { id, href });
  });
}
```

## Notas
- Si usas un gestor de estado global, escucha los eventos anteriores y reenvía la información a tu capa de datos.
- Para limpiar la preferencia almacenada, elimina `localStorage['crypto.toc.state']`.
