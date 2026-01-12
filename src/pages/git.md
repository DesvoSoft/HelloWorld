---
layout: ../layouts/MarkdownLayout.astro
title: Guía de Git
videoUrl: https://www.youtube.com/embed/zZdVwTjUtjg?si=W1LgM0J8b2Dbf1kl?autoplay=1&controls=0&loop=0&vq=hd1080
buttonText: git push
---

# Guía de Git

## ¿Qué es Git?

Git es un sistema de control de versiones (VCS) que rastrea los cambios en tus archivos. Permite a múltiples personas trabajar en un proyecto simultáneamente sin pisarse los pies, y facilita volver a versiones anteriores.

<br>

### Flujo de trabajo típico

1. Crear o clonar un repositorio (`git init` / `git clone`).
2. Editar archivos.
3. Preparar cambios (`git add`).
4. Guardar cambios (`git commit`).
5. Trabajar en ramas (`git branch`, `git checkout`).
6. Compartir cambios (`git push`, `git pull`).
7. Integrar cambios (`git merge`, `git rebase`, pull request).

<br>
<hr>
<br>

## Glosario

- **Repositorio:** Directorio con tu proyecto y su historial.
- **Commit:** Fotografía de los cambios en un punto del tiempo.
- **Branch:** Línea de desarrollo paralela.
- **Merge:** Unir cambios de diferentes ramas.
- **Pull Request:** Solicitud formal para fusionar cambios.
- **Rebase:** Reaplicar commits sobre otra rama para un historial más lineal.
- **Stash:** Guardar cambios temporalmente sin comprometer.

<br>
<hr>
<br>

## Configuración Inicial

Lo primero: configura tu identidad global:

```bash
$ git config --global user.name "Tu Nombre"
$ git config --global user.email "tuemail@ejemplo.com"
$ git config --list
```

Esto asegura que Git sepa quién realiza cada commit. `--global` aplica a todos los repositorios. Para un repositorio específico, omite `--global` y configúralo localmente.

<br>
<hr>
<br>

## Comandos Básicos

- `git init`: Crea la carpeta `.git` (historial) en el directorio actual.
- `git status`: Muestra cambios no rastreados, preparados y modificados.
- `git add [archivo]`: Prepara cambios para el próximo commit.
- `git commit -m "mensaje"`: Guarda los cambios preparados con un mensaje descriptivo.
- `git log --oneline`: Lista el historial de commits en una línea cada uno.

<br>

**Ejemplo guiado:**

```bash
$ mkdir mi_proyecto
$ cd mi_proyecto
$ git init
$ echo "Hola Mundo" > archivo.txt
$ git status
$ git add archivo.txt
$ git status
$ git commit -m "Agregar archivo inicial"
$ git log --oneline
```

<br>
<hr>
<br>

## Operaciones Avanzadas

### Rebase

Mantén un historial lineal moviendo tus commits al tope de otra rama.

```bash
# En feature-branch
$ git checkout feature-branch
$ git rebase origin/main
# Resolver conflictos si aparecen:
$ git add <archivos>
$ git rebase --continue
```

_Advertencia:_ No reescribas ramas compartidas.

<br>

### Cherry-pick

Aplica un solo commit a tu rama actual.

```bash
$ git log --oneline
$ git cherry-pick <SHA_del_commit>
# Resolver y confirmar
```

<br>

### Stash

Guarda cambios sin hacer commit, ideal para cambiar de tarea.

```bash
$ git stash
$ git status
$ git stash list
$ git stash pop
```

<br>

### Squash Commits

Combina múltiples commits en uno solo durante un rebase interactivo.

```bash
$ git rebase -i HEAD~3
# Marca 'squash' en los commits a combinar
```

<br>
<hr>
<br>

## Workflows Colaborativos y Flujo de Ramas

Las estrategias de branching ayudan a organizar el desarrollo en equipo y el ciclo de vida de las releases.

### Ejemplo de Flujo de Ramas

Supongamos que trabajamos en una nueva característica y luego la integramos:

```bash
# 1. Partir desde main actualizada
git checkout main
git pull origin main

# 2. Crear rama de feature
git checkout -b feature/login

# 3. Trabajar en la feature (editar, probar)
# ... hacer cambios ...

# 4. Preparar y commitear cambios
git add .
git commit -m "Implementar pantalla de login"

# 5. Volver a main y combinar
git checkout main
git merge feature/login

# 6. Subir a remoto
git push origin main
```

<br>

### Gitflow

Gitflow es un modelo popular para gestionar releases, features y hotfixes:

```bash
# Inicializar Gitflow (solo una vez)
git flow init

# Crear y finalizar una feature
git flow feature start nueva-funcionalidad
# ... trabajar ...
git flow feature finish nueva-funcionalidad

# Crear y terminar release
git flow release start v1.0.0
# ... preparar release ...
git flow release finish v1.0.0

# Crear hotfix
git flow hotfix start corregir-bug
# ... arreglar bug ...
git flow hotfix finish corregir-bug
```

Este flujo genera ramas `feature/*`, `release/*` y `hotfix/*`, manteniendo `develop` y `master` limpias.

<br>
<hr>
<br>

## Revisión y Comparación de Cambios

Antes de crear commits o durante las revisiones de código, es vital inspeccionar lo que ha cambiado, qué está preparado y cómo difiere del historial.

### Estado de los cambios

```bash
$ git status
# Muestra archivos modificados, no rastreados y preparados para commit.
```

<br>

### Comparar cambios no preparados

```bash
$ git diff
# Muestra las diferencias entre el working directory y el índice (staging area).
```

<br>

### Comparar cambios preparados

```bash
$ git diff --staged
# Muestra las diferencias entre el índice y el último commit.
```

<br>

### Ver un commit específico

```bash
$ git show <SHA_del_commit>
# Muestra los cambios introducidos por ese commit.
```

<br>

### Historial con diferencias

```bash
$ git log -p
# Incluye el patch (diff) junto a cada commit en el historial.
```

<br>

### Responsables de líneas

```bash
$ git blame archivo.txt
# Muestra qué commit y autor modificó cada línea del archivo.
```

<br>

### Bisect para encontrar errores

Divide y vencerás: usa `git bisect` para localizar el commit que introdujo un bug.

```bash
$ git bisect start
$ git bisect bad  # en estado con bug
$ git bisect good <SHA_del_commit_anterior>
# Git recorrerá commits; marca cada estado con 'good' o 'bad' hasta hallar el culpable.
```

<br>
<hr>
<br>

## Recursos Adicionales

- **Documentación:** [git-scm.com](https://git-scm.com/doc)
- **Tutoriales Interactivos:** [Learn Git Branching](https://learngitbranching.js.org/)
- **Guías:** [GitHub Guides](https://guides.github.com/), [Atlassian Git](https://www.atlassian.com/git)
- **Hojas de Referencia:** [FreeCodeCamp Cheat Sheet](https://www.freecodecamp.org/news/git-cheat-sheet/)

<br>
<hr>
<br>

Aprender Git es una inversión clave para desarrolladores.
