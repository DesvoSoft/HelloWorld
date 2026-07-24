# Hello World (DesvoSoft)

## Descripción

Sitio web dedicado a proporcionar recursos y guías de distintos temas relevantes a la evolución digital.

Nacido como un proyecto personal para practicar el control de versiones con Git y explorar el desarrollo web, este sitio busca ofrecer contenido conciso y práctico, especialmente útil para principiantes y aquellos que desean solidificar sus conocimientos básicos.

El contenido de este sitio web está destinado a fines informativos y no debe interpretarse como asesoramiento.

## Tecnología

Este proyecto ha sido migrado a **Astro**, un framework web moderno para sitios orientados a contenido.

- **Framework**: [Astro](https://astro.build)
- **UI/Estilos**: [Vitra](https://github.com/DesvoSoft/Vitra) — framework CSS propio de glassmorphism, integrado vía CDN (jsDelivr + SRI).
- **Contenido**: Markdown (`.md`) para guías y recursos.
- **Lenguaje**: JavaScript

## Instalación y Ejecución

1.  **Clonar el repositorio** (si no lo has hecho):

    ```bash
    git clone <url-del-repo>
    cd HelloWorld
    ```

2.  **Instalar dependencias**:

    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo**:

    ```bash
    npm run dev
    ```

    El sitio estará disponible en `http://localhost:4321`.

4.  **Construir para producción**:
    ```bash
    npm run build
    ```

## Temas

Actualmente, el sitio cubre los siguientes temas:

- **Python:** Recursos y guías sobre el lenguaje de programación Python. [Ver página](/python)
- **C++:** Fundamentos de programación en C++ con ejemplos prácticos. [Ver página](/cpp)
- **Java:** Fundamentos de Java, desde tipos y estructuras de datos hasta POO. [Ver página](/java)
- **Git:** Información esencial sobre el sistema de control de versiones Git. [Ver página](/git)
- **Crypto:** Guía extensa de criptomonedas (inversión, análisis técnico, futuros, ETFs, fiscalidad) con seguimiento de precios en vivo (BTC/ETH). [Ver página](/crypto)
- **Galería:** Colección de imágenes generadas con inteligencia artificial. [Ver galería](/)#images)

## Características

- **Arquitectura de Componentes:** Construido con Astro para modularidad y rendimiento.
- **Gestión de Contenido Simplificada:** Uso de Markdown para facilitar la edición y adición de nuevas guías.
- **Navegación Intuitiva:** Fácil acceso a los diferentes temas con un diseño limpio.
- **Responsive Design:** Adaptable a diferentes tamaños de pantalla y dispositivos.
- **UI Moderna:** Interfaces pulidas con temas oscuros y organización optimizada de recursos.

## Estructura del Proyecto

- `src/pages/`: Rutas del sitio (archivos `.astro` y `.md`).
- `src/components/`: Componentes reutilizables (Navbar, CoinTracker, etc.).
- `src/layouts/`: Plantillas base (`Layout.astro`) y especializadas (`MarkdownLayout.astro`).
- `src/styles/`: Archivos CSS organizados por propósito y página.
- `src/scripts/`: Scripts JavaScript para funcionalidades interactivas.
- `public/`: Activos estáticos organizados en subcarpetas:
  - `public/images/gallery/`: Galería de imágenes generadas con IA
  - `public/images/docs/`: Imágenes de documentación y diagramas
  - `public/images/`: Iconos y recursos generales

© 2026 DesvoSoft
