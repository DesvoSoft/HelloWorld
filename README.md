# Hello World (DesvoSoft)

![Logo del proyecto](/images/theme.ico)

## Descripción

Hello World es un sitio web dedicado a proporcionar recursos y guías de distintos temas relevantes a la evolución digital.

Nacido como un proyecto personal para practicar el control de versiones con Git y explorar el desarrollo web, este sitio busca ofrecer contenido conciso y práctico, especialmente útil para principiantes y aquellos que desean solidificar sus conocimientos básicos.

El contenido de este sitio web está destinado a fines informativos y no debe interpretarse como asesoramiento. Usted acepta usar el sitio web bajo su propio riesgo.

## Tecnología

Este proyecto ha sido migrado a **Astro**, un framework web moderno para sitios orientados a contenido.

- **Framework**: [Astro](https://astro.build)
- **Lenguaje**: TypeScript / JavaScript
- **Estilos**: CSS (Legacy & Scoped)

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
- **Raptor:** Una herramienta de práctica de mecanografía. [Ver página](/raptor)
- **Crypto:** Exploración de temas relacionados con las criptomonedas. [Ver página](/crypto)

## Características

- **Arquitectura de Componentes:** Construido con Astro para modularidad y rendimiento.
- **Navegación Intuitiva:** Fácil acceso a los diferentes temas.
- **Responsive Design:** Adaptable a diferentes tamaños de pantalla.
- **Información de Contacto:** Formas sencillas de contactar al creador.

## Estructura del Proyecto

- `src/pages/`: Rutas del sitio (archivos `.astro`).
- `src/components/`: Componentes reutilizables (Navbar, etc.).
- `src/layouts/`: Plantillas base para las páginas.
- `src/styles/`: Archivos CSS.
- `public/`: Activos estáticos (imágenes).

## Licencia

© 2025 DesvoSoft
