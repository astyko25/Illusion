# Illusion

Illusions d'optique interactives, rendues en direct dans le navigateur.

## n° 01 — Rotation ambiguë

`index.html` — une page autonome, sans dépendance ni build.

Un nuage de ~34 000 points décrit deux surfaces de révolution imbriquées : une
coque sphéroïdale ouverte aux pôles, et une paire d'entonnoirs qui rentrent par
ces ouvertures et se rejoignent en une colonne axiale.

L'illusion tient à ce qui a été retiré du rendu : **projection orthographique**,
pas de perspective, pas d'ombre, et une luminosité strictement indépendante de la
profondeur. Deux volumes 3D produisent alors exactement la même image animée —
l'un tournant vers la droite, l'autre vers la gauche. Le cerveau tranche
arbitrairement, puis bascule.

### Contrôles

| Contrôle | Effet |
| --- | --- |
| Vitesse | tours par seconde |
| Évasement | profil des entonnoirs, de `a²` (trompette) à `a⁴` (aiguille) |
| Densité | 6 000 à 60 000 points |
| Imposer un sens | maintenir pour réintroduire un indice de profondeur et forcer la lecture |
| Révéler la profondeur | supprime l'ambiguïté en permanence |

Un glissement horizontal sur le spécimen le fait tourner à la main.

### Rendu

Le pipeline n'utilise ni WebGL ni `fillRect`. Chaque point est accumulé en
bilinéaire dans un tampon flottant, puis compressé vers une `ImageData`. Seuls
les pixels effectivement éclairés sont parcourus — la liste des pixels touchés à
la frame précédente sert aussi à l'effacement, ce qui garde le coût proportionnel
au nombre de points et non à la surface du canvas.

La compression tonale s'applique au canal le plus lumineux et met les deux autres
à l'échelle du même facteur, pour que les zones denses saturent en couleur
plutôt qu'en blanc.

### Utilisation

Ouvrir `index.html` dans un navigateur. C'est tout.
