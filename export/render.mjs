/* Headless renderer: studio.html -> PNG frames -> H.264 MP4 for Reels.
 *
 * Scenes draw as a pure function of loop phase, so frames are stepped rather
 * than timed. Nothing here depends on how fast the machine renders, and the
 * last frame always joins the first.
 *
 *   node export/render.mjs            toute la série
 *   node export/render.mjs anneau     une seule illusion
 *   node export/render.mjs anneau --fps 30 --sortie /tmp
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");

const argv = process.argv.slice(2);
const opt = (nom, def) => {
  const i = argv.indexOf("--" + nom);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
// Positional args are whatever is left once each --flag has swallowed its value.
const positionnels = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) i++;
  else positionnels.push(argv[i]);
}
const cible = positionnels[0] ?? "all";
const FPS = Number(opt("fps", 30));
// A perceptual reversal takes time to arrive — often twenty seconds or more of
// staring. One rotation is not a Reel, it is a fragment. Scenes therefore
// declare the length of one cycle, and the export repeats it to reach a length
// worth watching.
const CIBLE = Number(opt("duree", 32));
const SORTIE = path.resolve(opt("sortie", path.join(ICI, "sortie")));
const LARGEUR = 1080, HAUTEUR = 1920;

function ffmpeg(args) {
  return new Promise((ok, ko) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("error", ko);
    p.on("close", (c) => (c === 0 ? ok() : ko(new Error("ffmpeg " + c + "\n" + err.slice(-1500)))));
  });
}

const navigateur = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium",
  args: ["--force-color-profile=srgb", "--disable-lcd-text"]
});
const page = await navigateur.newPage({ viewport: { width: 600, height: 900 } });
const erreurs = [];
page.on("pageerror", (e) => erreurs.push(e.message));
page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
const verifie = () => {
  if (erreurs.length) throw new Error("erreur dans la page :\n  " + erreurs.join("\n  "));
};

await page.goto("file://" + path.join(RACINE, "studio.html") + "?export=1");
await page.waitForFunction(() => window.__pret === true, null, { timeout: 30000 });
verifie();

const toutes = await page.evaluate(() => window.__scenes());
const choisies = cible === "all" ? toutes : toutes.filter((s) => s.id === cible);
if (!choisies.length) {
  await navigateur.close();
  console.error("Illusion inconnue : " + cible + "\nDisponibles : " + toutes.map((s) => s.id).join(", "));
  process.exit(1);
}

await mkdir(SORTIE, { recursive: true });

for (const scene of choisies) {
  const frames = Math.round(scene.duree * FPS);
  const tmp = path.join(SORTIE, ".frames-" + scene.id);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });

  const boucles = Math.max(1, Math.round(CIBLE / scene.duree));
  process.stdout.write(
    `\n${scene.index}  ${scene.nom}  —  ${frames} images à ${FPS} i/s` +
    `  ×${boucles} = ${(scene.duree * boucles).toFixed(0)} s\n`
  );
  await page.evaluate((id) => window.__scene(id), scene.id);
  verifie();

  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const dataUrl = await page.evaluate(([i, n]) => {
      window.__frame(i, n);
      return document.getElementById("cv").toDataURL("image/png");
    }, [i, frames]);
    await writeFile(
      path.join(tmp, String(i).padStart(5, "0") + ".png"),
      Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64")
    );
    if (i % 20 === 0 || i === frames - 1) {
      process.stdout.write(`\r  rendu ${i + 1}/${frames}`);
    }
  }

  verifie();
  const fichier = path.join(SORTIE, `${scene.index.replace(/\D+/g, "")}-${scene.id}.mp4`);
  const cycle = boucles > 1 ? path.join(tmp, "cycle.mp4") : fichier;
  await ffmpeg([
    "-y", "-framerate", String(FPS),
    "-i", path.join(tmp, "%05d.png"),
    // Per-frame speckle is the worst case there is for inter-frame prediction:
    // at CRF 17 the ring alone came out at 32 Mbit/s. Instagram re-encodes Reels
    // to roughly 4 Mbit/s, so everything above about 8 is discarded on upload —
    // the cap buys a much smaller file for no visible loss.
    "-c:v", "libx264", "-preset", "slow", "-crf", "20",
    "-maxrate", "8M", "-bufsize", "16M",
    // yuv420p and even dimensions: anything else and Instagram re-encodes or rejects.
    "-pix_fmt", "yuv420p",
    "-vf", `scale=${LARGEUR}:${HAUTEUR}:flags=lanczos`,
    "-movflags", "+faststart",
    cycle
  ]);

  if (boucles > 1) {
    // The cycle already joins itself frame-perfectly, so repeating it is a
    // stream copy: no re-encode, no generation loss, and the repeats cost
    // almost nothing on top of the first pass.
    const liste = path.join(tmp, "boucles.txt");
    await writeFile(liste, Array(boucles).fill(`file '${cycle}'`).join("\n") + "\n");
    await ffmpeg([
      "-y", "-f", "concat", "-safe", "0", "-i", liste,
      "-c", "copy", "-movflags", "+faststart", fichier
    ]);
  }

  await rm(tmp, { recursive: true, force: true });
  process.stdout.write(`\r  ${path.relative(RACINE, fichier)}  (${((Date.now() - t0) / 1000).toFixed(1)} s)\n`);
}

await navigateur.close();
process.stdout.write("\nTerminé.\n");
