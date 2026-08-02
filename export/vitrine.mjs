/* Inlines the studio into a single self-contained file.
 *
 * The studio itself loads the engine and the illusions as separate scripts,
 * which is how you want to work on them. A published page cannot fetch anything
 * external, so this folds the whole tree — fonts included, already base64 in
 * fonts.css — into one document that opens from a file:// path, a static host,
 * or an artifact with identical results.
 *
 *   node export/vitrine.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lis = (p) => readFile(path.join(RACINE, p), "utf8");

let html = await lis("studio.html");

// Stylesheet link -> inline <style>
const css = await lis("engine/fonts.css");
html = html.replace(
  /<link rel="stylesheet" href="engine\/fonts\.css">/,
  "<style>\n" + css.trim() + "\n</style>"
);

// Each external <script src> -> inline module body
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)];
for (const [balise, src] of srcs) {
  const js = await lis(src);
  html = html.replace(balise, "<script>\n/* " + src + " */\n" + js.trim() + "\n</script>");
}

// The artifact host supplies its own doctype/head/body skeleton; a bare
// fragment also parses correctly when opened straight from disk.
html = html
  .replace(/^<!doctype html>\s*<html lang="fr">\s*<head>\s*/i, "")
  .replace(/<meta name="viewport"[^>]*>\s*/i, "")
  .replace(/\s*<\/head>\s*<body>/i, "")
  .replace(/\s*<\/body>\s*<\/html>\s*$/i, "\n");

await writeFile(path.join(RACINE, "vitrine.html"), html);
const ko = (Buffer.byteLength(html) / 1024).toFixed(0);
process.stdout.write(`vitrine.html  ${ko} Ko  (${srcs.length} scripts + polices inlinés)\n`);
