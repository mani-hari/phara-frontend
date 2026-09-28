# parihara-preferred-image-style — "Twilight tonalism"

Adopted by Mani on 28 Sep 2026 as the house style for every generated image on
pariharaonline.com (blog heroes, newsletters, instruction PDFs, product artwork).
Code: `scripts/lib/image-style.mjs` (STYLE_SUFFIX is appended to every prompt).

## What it looks like

- Painterly oil-on-linen scenes at **dusk or dawn**.
- **One warm light source**: a lamp, a fire, a low sun, and it *fills* the scene with a golden glow. Luminous, never gloomy: midtones stay warm and readable (owner note, 28 Sep 2026: "golden glow and serene, not dark as if there is no light in the world").
- Sky and background run **gold → orange → violet**.
- **Soft atmospheric haze**, loose visible brushwork, edges dissolve; no hard outlines, no
  photographic sharpness.
- Subjects are **places and objects charged with meaning** (a Nandi from behind, a gopuram, a
  boat of banana leaves, a hilltop flame) rather than deities portrayed head-on.
- **People appear as small silhouettes or from behind. Never faces.**
- Mood: calm, devotional, slightly otherworldly. Art-historical anchors: Tonalism and Luminism,
  with a touch of Bengal School wash painting.

## Rules for prompt writers

1. Write the scene in one sentence: subject, setting, light, one or two telling details.
2. Do not restate the style — `stylePrompt()` appends it. Do not ask for text in the image.
3. No faces, no explicit bodies, no medical or intimate imagery; suggest with objects (a calendar,
   a lamp, a spoon, folded hands, a bottle with a single drop).
4. Deities: prefer the shrine, the lamps, the garland, the sanctum glow. If a deity must appear,
   the owner decides case by case.
5. Watermark "pariharaonline.com" centred, slightly low-right, on anything published on the web;
   none on customer PDFs.

## Reference images (blog heroes that defined the style)

pradosham-meaning, swayamvara-parvathi-story, holi-meaning-prahlad-holika,
dussehra-ravana-story-meaning, satyanarayan-katha-meaning, six-abodes-of-murugan,
karthigai-deepam-significance (all under `public/blog/`).
