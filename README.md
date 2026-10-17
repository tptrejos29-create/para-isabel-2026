# ✦ Isabel — una historia bajo las estrellas

Página web romántica (HTML + CSS + JS, sin dependencias), pensada para celular y PC.
Concepto: sobre de entrada → 6 capítulos sobre un cielo estrellado → capítulo final bloqueado con cuenta regresiva.

## Lo opcional

1. **Más fotos** (opcional): ponlas en `img/` y agrégalas a la lista `fotos` en `js/config.js`.

## Todo se personaliza en `js/config.js`

| Campo | Qué hace |
|---|---|
| `nombre` | Nombre que aparece en el sobre, portada y carta |
| `desde` | Inicio del contador "Desde aquel día" (6 oct 2026) |
| `propuesta` | Momento en que se desbloquea el capítulo final (31 oct 2026, 00:00) |
| `canciones` | Título, artista y archivo de la canción (`music/leni.mp3`) |
| `fotos` | Fotos de los polaroids, con título y pie |

La **carta** está en `index.html`, dentro de `<article class="letter">`.

## Cómo probarla antes del gran día

Abre la página agregando esto al final de la dirección:

- `?dia` → muestra el capítulo final ya desbloqueado ("Hoy es el día").
- `?t=2026-10-30T23:59:40` → simula esa fecha y hora para ver cómo cambia la cuenta regresiva.

## Cómo publicarla (GitHub Pages)

1. Crea un repositorio y sube todo el contenido de esta carpeta.
2. Settings → Pages → Branch `main` / `(root)` → Save.
3. Comparte el enlace con ella. La página lleva `noindex` para que no aparezca en buscadores.

> Nota: los navegadores solo reproducen audio tras un toque del usuario; por eso la música arranca
> cuando ella toca el sobre.

*Hecho con ♥ por Johan*
