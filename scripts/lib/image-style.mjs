// PariharaOnline preferred image style — "twilight tonalism" (owner decision, 28 Sep 2026).
// Single source of truth for every generated image (blog heroes, newsletter art, PDFs, product art).
// Human description: docs/parihara-preferred-image-style.md

export const STYLE_NAME = "parihara-preferred-image-style"

/** Appended to every prompt. Keep in one place so the look stays consistent. */
export const STYLE_SUFFIX = [
  "Painterly oil on linen, twilight tonalism",
  "a single warm light source (lamp, fire or low sun) against a sky or background that runs gold to orange to violet",
  "soft atmospheric haze, visible loose brushwork, muted edges, no hard outlines",
  "calm, devotional, otherworldly mood",
  "South Indian temple and home aesthetic",
  "figures only as small silhouettes or seen from behind, no faces",
  "no text, no captions, no letters, no logos, no watermark",
].join(", ")

/** Things the model must not do; some APIs accept a negative prompt, otherwise we fold it into the suffix. */
export const STYLE_NEGATIVE = "photograph, photorealistic, sharp focus, flat vector, cartoon, neon, text, watermark, faces"

export const MODEL = "openai/gpt-image-1-mini"
export const GEN_SIZE = "1536x1024"

/** Build the final prompt for a scene description. */
export function stylePrompt(scene) {
  const s = String(scene || "").trim().replace(/[.\s]+$/, "")
  return `${s}. ${STYLE_SUFFIX}. Avoid: ${STYLE_NEGATIVE}.`
}
