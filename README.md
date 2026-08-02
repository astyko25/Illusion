# Illusion

Illusions d'optique interactives, rendues en direct dans le navigateur.

## n° 01 — Anneau ambigu

`index.html` — une page autonome, sans dépendance ni build.

Un nuage de ~34 000 points décrit un **tore**, et surtout : il ne tourne pas sur
son axe de symétrie, il **bascule autour de la verticale**. L'anneau s'ouvre en
disque, se referme en ellipse, puis en sablier, et recommence.

L'axe n'est pas un détail — c'est tout le sujet. Une surface de révolution qui
tourne sur son propre axe donne une image invariante : seul le grain se déplace,
la silhouette ne bouge jamais, et il n'y a rien à inverser. C'est la bascule qui
crée les deux lectures.

L'illusion tient ensuite à ce qui a été retiré du rendu : **projection
orthographique**, pas de perspective, pas d'ombre, et une luminosité strictement
indépendante de la profondeur. Deux volumes 3D produisent alors exactement la
même image animée — l'un basculant vers l'avant, l'autre vers l'arrière. Le
cerveau tranche arbitrairement, puis bascule.

### Contrôles

| Contrôle | Effet |
| --- | --- |
| Vitesse | tours par seconde |
| Épaisseur | rayon du tube, de l'anneau fin à la bouée |
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
