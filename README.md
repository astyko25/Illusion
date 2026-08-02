# BISTABLE

Illusions d'optique rendues en direct dans le navigateur, et exportées en Reels
Instagram 1080 × 1920 prêts à publier.

Aucune dépendance côté page : pas de build, pas de framework, pas de CDN. Les
polices sont inlinées en woff2, donc le rendu est identique dans le navigateur,
dans l'exportateur headless et derrière la CSP d'une page publiée.

## Démarrer

```bash
npm install                      # playwright, pour l'export uniquement
open studio.html                 # prévisualiser et régler
node export/render.mjs anneau    # produire un MP4
node export/render.mjs           # produire toute la série
node export/render.mjs --duree 60   # viser des Reels d'une minute
```

L'export a besoin de `ffmpeg` sur le PATH (`apt install ffmpeg`,
`brew install ffmpeg`). Les fichiers atterrissent dans `export/sortie/`.

## La série

| | Illusion | Ce qui est retiré | Cycle | Reel |
| --- | --- | --- | --- | --- |
| n° 01 | Anneau ambigu | profondeur — un tore qui bascule autour de la verticale | 9 s | 36 s |
| n° 02 | Silhouette tournante | ombrage et occlusion — un corps en aplat | 6 s | 30 s |
| n° 03 | Cube de Necker | les arêtes cachées — aucune face n'est privilégiée | 10 s | 30 s |
| n° 04 | Serpents tournants | rien : l'image est fixe, la rotation est fabriquée par la rétine | 8 s | 32 s |
| n° 05 | Damier d'Adelson | rien : deux cases portent le même gris, à l'octet près | 12 s | 36 s |

Une scène déclare la durée d'**un cycle**. L'export le répète pour atteindre la
longueur visée (`--duree`, 32 s par défaut) : une bascule perceptive demande
souvent vingt secondes ou plus d'observation, et un tour unique ne laisse pas le
temps au basculement d'arriver. Comme le cycle se referme à l'image près, les
répétitions sont une copie de flux — pas de réencodage, pas de perte, et un coût
quasi nul.

Le n° 05 choisit sa paire de cases en sondant l'image finie, avec l'égalité
exacte des pixels comme contrainte : si aucune paire ne la satisfait, le rendu
échoue au lieu de produire un post dont la légende serait fausse.

Les n° 01 à 03 sont bistables — deux lectures également valides, et le cerveau
bascule de l'une à l'autre. Les n° 04 et 05 ne sont pas ambiguës : elles sont
fausses, et la page le prouve.

## Architecture

```
engine/
  fonts.css     Archivo 400/800 + IBM Plex Mono 500, inlinés en base64
  splat.js      rendu par accumulation pour les nuages de points
  stage.js      canvas, cadre de marque, horloge déterministe
illusions/
  0*.js         une illusion par fichier, enregistrée dans window.ILLUSIONS
studio.html     prévisualisation, réglages, position dans la boucle
vitrine.html    le studio replié en un seul fichier autonome (généré)
export/
  render.mjs    Chromium headless -> images PNG -> MP4 H.264
  vitrine.mjs   génère vitrine.html
index.html      page longue consacrée à l'illusion n° 01
```

### Le contrat d'une scène

Une illusion dessine en **fonction pure de la position dans la boucle**, un
nombre dans `[0,1)`. Rien ne lit l'horloge système. C'est ce qui permet à
l'exportateur d'avancer image par image au lieu de filmer en temps réel : le
résultat ne dépend pas de la vitesse de la machine, et la dernière image
raccorde exactement la première. Vérifié en mesure — le pas 179 → 0 donne le
même PSNR qu'un pas ordinaire.

```js
ILLUSIONS.push({
  id: "anneau", index: "N° 01", nom: "Anneau ambigu",
  question: "…",                       // incrustée en haut du Reel
  duree: 9,                            // secondes pour une boucle
  revele: { debut: 0.5, texte: "…" },  // facultatif : lève l'illusion en fin de boucle
  params: [ { id: "tube", nom: "Épaisseur", min: 15, max: 80, val: 43, div: 100 } ],
  init(env, p) {},                     // facultatif, rappelé à chaque changement de réglage
  dessine(env, phase, p, indice) {}
});
```

`indice` monte de 0 à 1 quand la scène révèle sa profondeur — piloté par la
boucle via `revele`, ou forcé depuis le studio.

### Le rendu par points

Les points sont accumulés en bilinéaire dans un tampon flottant puis compressés
vers une `ImageData`. Seuls les pixels réellement éclairés sont parcourus : la
liste des pixels de l'image précédente sert aussi à l'effacement, ce qui rend le
coût proportionnel au nombre de points et non à la surface du canvas.

La courbe tonale s'applique au canal le plus lumineux et met les deux autres à
la même échelle, pour que les zones denses saturent en couleur plutôt qu'en
blanc.

## Ajouter une illusion

1. Créer `illusions/06-machin.js` sur le modèle ci-dessus.
2. L'ajouter aux `<script>` de `studio.html`.
3. `node export/vitrine.mjs` pour régénérer la version autonome.

Le cadre de marque — question, filets, signature — est appliqué par `stage.js`.
Une scène n'a que son spécimen à dessiner.
