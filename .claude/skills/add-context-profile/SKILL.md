---
name: add-context-profile
description: Add a new context profile to boutique-trend's getContextProfile() in app.js. Use when the user wants to extend the AI copy generator with a new occasion, season, or mood (e.g. "graduación", "Navidad", "yoga", "festival"). Generates the regex matcher, the 5 template callbacks, seoHook, emoji and 4 hashtags following the shape of the existing 9 profiles and inserts the block right before the fallback.
---

# Add Context Profile

Extends the boutique-trend copy generator with a new context. Each profile reshapes the full narrative — web opening, sensory body, web closing, SEO hook, Instagram voice and hashtags — based on what the user writes in the "Contexto / Ocasión" field.

## Inputs

If not provided as args, ask the user for:
1. **Slug** (kebab/snake, ASCII, e.g. `graduacion`, `navidad`, `yoga`).
2. **Trigger keywords** — comma-separated Spanish + English forms the user might type. Include accented and unaccented variants (e.g. "graduación, graduacion, toga, fin de carrera, promoción").
3. **Emotional tone** in one phrase (e.g. "celebratory milestone with pride").

Do NOT ask for the template strings — generate them yourself from the tone, in the voice of existing profiles.

## Exact shape to emit

```js
if (test(/\b(KEYWORD1|KEYWORD2|...)\b/)) {
    return {
        key: 'SLUG',
        webOpen: (p) => `OPENING HOOK that names the ${p}.`,
        webBody: (m, col) => `SENSORY BODY in ${m} with the ${col} tone.`,
        webClose: (ctx) => `CLOSING with concrete imagery for ${ctx}.`,
        seoHook: 'short adjective+noun search phrase',
        igEmoji: 'SINGLE_EMOJI',
        igHook: 'IG opening line.',
        igClose: 'IG closing line. EMOJI',
        hashtags: ['#Tag1', '#Tag2', '#Tag3', '#Tag4']
    };
}
```

## Voice rules (match the existing 9 profiles)

- **webOpen**: 1 sentence, evocative, references `${p}` (prenda).
- **webBody**: 1–2 sentences, sensory; must reference both `${m}` (material) and `${col}` (color).
- **webClose**: 1 sentence with concrete imagery of the occasion; references `${ctx}` (contexto).
- **seoHook**: short adjective+noun phrase, no verb ("elegante para eventos", "cómodo para el día a día").
- **igHook**: ≤ 14 words, intriguing or aspirational, ends with the emoji on its own line (matches existing profiles' usage in `generateCopy`).
- **igClose**: ≤ 8 words + 1 emoji.
- **hashtags**: exactly 4, CamelCase, mix of English + Spanish allowed but no spaces.

Tone is alta costura minimalist: confident, sensual when appropriate, never cheesy. Avoid clichés like "indispensable", "must-have", "imprescindible", "obsessed".

Regex must use `\b` word boundaries and lowercase alternatives (the input is already lowercased upstream). Include both accented and unaccented variants explicitly: `(graduacion|graduación)`.

## Insertion

Target file: `/Users/dmendez/Documents/Curso Antigravity/Proyecto final/boutique-trend/app.js`

Locate `function getContextProfile(contexto)`. Insert the new `if (test(...))` block **immediately before** the comment line `// Fallback profile — refined neutral tone.` so the fallback always stays last.

If a profile with the same `key` already exists in the file, stop and ask the user whether to overwrite it or pick a different slug.

## Verification

After editing:
1. Run `node --check app.js` and confirm it returns clean.
2. Echo to the user: the regex you generated, the line range where you inserted, and one example contexto string that should now trigger it.

Do NOT start the dev server, open the browser, or touch `style.css` / `index.html` — this skill is scoped to the JS data block only.
