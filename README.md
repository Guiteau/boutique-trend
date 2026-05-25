[![GitHub Pages](https://img.shields.io/badge/demo-live-success?logo=github)](https://guiteau.github.io/boutique-trend/)

# Boutique Trend

> 🔗 **Demo en vivo:** [guiteau.github.io/boutique-trend](https://guiteau.github.io/boutique-trend/)

Asistente de copywriting para boutiques de moda. Genera ficha web, meta SEO y copy de Instagram a partir de seis datos de la prenda (prenda, marca, material, color, estilo y contexto/ocasión).

## ✨ Características

- **9 perfiles de contexto** que reescriben el tono emocional completo del texto según la ocasión (verano, invierno, gala, oficina, noche, primavera, otoño, viaje, casual) + fallback neutro.
- **Contador SEO en tiempo real** sobre la meta-descripción, con aviso visual a partir de 141 caracteres y error a partir de 155.
- **Validación visual** con micro-animación *shake* en los campos vacíos.
- **Copia al portapapeles** por bloque, con el texto SEO limpio (sin contadores).
- **Mosaico textil + acentos pastel** (blush, salvia, champán) sobre paleta alta costura.

## 🚀 Cómo probarlo

Puedes usarlo directamente en la [demo en vivo](https://guiteau.github.io/boutique-trend/), o levantarlo en local — no tiene dependencias ni build step:

```bash
python3 -m http.server 8000
```

Y abre [http://localhost:8000](http://localhost:8000).

## 🗂️ Estructura

```
index.html   · estructura semántica
style.css    · paleta alta costura + mosaico SVG
app.js       · validación, contador SEO y perfiles de contexto
```

## 🧩 Extender contextos

El proyecto incluye un skill de Claude Code (`.claude/skills/add-context-profile`) que añade nuevos perfiles siguiendo la voz existente. Invócalo con:

```
/add-context-profile
```

Te pedirá un slug, las keywords disparadoras y el tono emocional, y generará el bloque consistente con los 9 perfiles ya existentes, insertándolo antes del fallback en `app.js`.

## 🛠️ Stack

HTML5, CSS3 (custom properties + `backdrop-filter`), JavaScript vanilla. Cero dependencias.
