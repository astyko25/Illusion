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
| n° 06 | Spirale de Fraser | la spirale — ce sont des cercles fermés en cordage torsadé | 11 s | 33 s |
| n° 07 | Mur du café | l'inclinaison — des rangées horizontales et un mortier intermédiaire | 11 s | 33 s |
| n° 08 | Ebbinghaus | l'échelle absolue — deux disques identiques, deux entourages | 12 s | 36 s |
| n° 09 | Nœud de trèfle | profondeur — quel brin passe devant reste indécidable | 11 s | 33 s |
| n° 10 | Ruban de Möbius | profondeur — une face, un bord, aucun sens de rotation | 11 s | 33 s |
| n° 11 | Sphère de points | tout sauf le mécanisme : la silhouette ne bouge jamais | 9 s | 36 s |
| n° 12 | La tour Eiffel | profondeur — un objet familier reste pourtant indécidable | 12 s | 36 s |
| n° 13 | Le visage | profondeur — mais le préjugé de visage refuse l'égalité des deux lectures | 12 s | 36 s |
| n° 14 | La Joconde | profondeur — et un test de ce que le médium retient d'une identité | 13 s | 39 s |

Une scène déclare la durée d'**un cycle**. L'export le répète pour atteindre la
longueur visée (`--duree`, 32 s par défaut) : une bascule perceptive demande
souvent vingt secondes ou plus d'observation, et un tour unique ne laisse pas le
temps au basculement d'arriver. Comme le cycle se referme à l'image près, les
répétitions sont une copie de flux — pas de réencodage, pas de perte, et un coût
quasi nul.

Le n° 04 est le seul dont l'effet ne se vérifie pas en mesurant des pixels : il
n'existe que dans la perception. Ce qui se contrôle est la conformité à la
recette publiée, et elle l'est point par point : séquence `{noir, g1, blanc, g2}`
avec g1 = 20,4 % et g2 = 61,1 % de luminance linéaire (l'optimum mesuré sur les
images de Kitaoka est 20 % / 60 %), tuiles carrées sur tous les anneaux, fond
plus clair que les tuiles noires, motif assez grand pour atteindre la vision
périphérique.

Il n'y a **pas** de point de fixation, et c'est délibéré : l'effet est déclenché
par les microsaccades et les clignements, et il disparaît en fixation stable.
Un repère invitant l'œil à se poser est la seule chose qui le supprime à coup
sûr. L'instruction est donc dans la question. Environ 5 % des personnes ne
voient rien malgré tout.

Le n° 05 choisit sa paire de cases en sondant l'image finie, avec l'égalité
exacte des pixels comme contrainte : si aucune paire ne la satisfait, le rendu
échoue au lieu de produire un post dont la légende serait fausse.

Les n° 01 à 03 sont bistables — deux lectures également valides, et le cerveau
bascule de l'une à l'autre. Les autres ne sont pas ambiguës : elles sont
fausses, et la page le prouve dans la seconde moitié de la boucle.

Les n° 06 à 08 ont été choisies pour leur robustesse : la quasi-totalité des
gens les perçoivent, contrairement à la dérive périphérique du n° 04.

Le n° 12 lève le doute sur la familiarité : un objet reconnaissable verrouille
d'ordinaire une perception bistable sur sa lecture attendue, mais pas ici. La
tour tourne autour de son axe vertical, et les deux lectures la laissent
debout — le préjugé de gravité n'a aucune prise sur le sens de rotation.

Le n° 14 répond par la négative à une question qu'on se posait : non, ce médium
ne transporte pas la Joconde. Le buste se tient, mais personne ne la nommerait.
Le résultat est moins décevant qu'instructif — **on ne connaît pas la Joconde
par sa géométrie**. Personne ne l'a jamais vue en trois dimensions : ce qu'on
reconnaît est une image peinte, sa couleur, son sfumato, son paysage. Réduite à
une forme, il ne reste rien qui la désigne. Le test ne se généralise donc pas :
pour quelqu'un qu'on connaît *en volume* — vu bouger, sous tous les angles — la
géométrie est précisément par où on le reconnaît.

Le n° 13 porte des **réglages d'identité** — largeur du crâne, mâchoire, nez,
arcades, lèvres, écartement des yeux — pour répondre à une question précise : ce
médium transporte-t-il un visage *particulier* ? Réponse mesurée : il sépare
franchement les morphologies, mais il retire par construction la texture et le
détail fin, qui sont l'essentiel de ce qui rend une personne reconnaissable. Il
est bon pour un type de visage, douteux pour un portrait.

Le n° 13 est le seul de la famille qui ne soit *pas* une pièce équilibrée. Pour
toutes les autres formes, les deux lectures se valent et la perception dérive de
l'une à l'autre. Pour un visage, le préjugé est si fort que la perception force
la lecture convexe et tournée vers l'observateur — le même préjugé qui empêche
un masque creux de paraître creux. Le visage semble donc refuser de se
détourner. Il est procédural, sans photographie ni personne réelle : outre la
question du droit à l'image, une image 2D ne porte aucune profondeur à
reconstruire.

Les n° 09 à 11 forment un banc d'essai. Toute forme 3D rendue sans indice de
profondeur devient bistable, donc `engine/forme.js` mutualise l'opération et une
nouvelle illusion se réduit à sa paramétrisation. Le n° 11 y sert de témoin :
dépouillé de toute forme à admirer — sa silhouette est un cercle immobile —
il isole le mécanisme seul.

## Architecture

```
engine/
  fonts.css     Archivo 400/800 + IBM Plex Mono 500, inlinés en base64
  splat.js      rendu par accumulation, tampon rectangulaire
  forme.js      nuage 3D tournant sans indice de profondeur, mutualisé
  stage.js      canvas, cadre de marque, horloge déterministe
illusions/
  0*.js         une illusion par fichier, enregistrée dans window.ILLUSIONS
studio.html     prévisualisation, réglages, position dans la boucle
vitrine.html    le studio replié en un seul fichier autonome (généré)
export/
  render.mjs    Chromium headless -> images PNG -> MP4 H.264
  vitrine.mjs   génère vitrine.html
index.html      page longue consacrée à l'illusion n° 01
legendes.md     légendes des Reels et ordre de publication
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
