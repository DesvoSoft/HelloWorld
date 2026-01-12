# Hello World (DesvoSoft)

![Logo](/images/theme.ico)

## Descripción

Hello World es un sitio web dedicado a proporcionar recursos y guías de distintos temas relevantes a la evolución digital.

Nacido como un proyecto personal para practicar el control de versiones con Git y explorar el desarrollo web, este sitio busca ofrecer contenido conciso y práctico, especialmente útil para principiantes y aquellos que desean solidificar sus conocimientos básicos.

El contenido de este sitio web está destinado a fines informativos y no debe interpretarse como asesoramiento. Usted acepta usar el sitio web bajo su propio riesgo.

## Tecnología

Este proyecto ha sido migrado a **Astro**, un framework web moderno para sitios orientados a contenido.

- **Framework**: [Astro](https://astro.build)
- **Contenido**: Markdown (`.md`) para guías y recursos.
- **Lenguaje**: TypeScript / JavaScript
- **Estilos**: CSS (Vanilla, Legacy & Scoped)

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
- **Git:** Información esencial sobre el sistema de control de versiones Git. [Ver página](/git)
- **Raptor:** Una herramienta de práctica de mecanografía con diseño moderno. [Ver página](/raptor)
- **Crypto:** Exploración de temas relacionados con las criptomonedas, incluyendo avisos legales interactivos. [Ver página](/crypto)

## Características

- **Arquitectura de Componentes:** Construido con Astro para modularidad y rendimiento.
- **Gestión de Contenido Simplificada:** Uso de Markdown para facilitar la edición y adición de nuevas guías.
- **Navegación Intuitiva:** Fácil acceso a los diferentes temas con un diseño limpio.
- **Responsive Design:** Adaptable a diferentes tamaños de pantalla y dispositivos.
- **UI Moderna:** Interfaces pulidas con temas oscuros y acentos vibrantes (ej. Raptor Typing).

## Estructura del Proyecto

- `src/pages/`: Rutas del sitio (archivos `.astro` y `.md`).
- `src/components/`: Componentes reutilizables (Navbar, etc.).
- `src/layouts/`: Plantillas base (`Layout.astro`) y especializadas (`MarkdownLayout.astro`).
- `src/styles/`: Archivos CSS organizados por propósito y página.
- `public/`: Activos estáticos (imágenes, iconos).

## Licencia

© 2025 DesvoSoft
