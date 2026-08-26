# Diagrammes de séquence

| Fichier | Contenu | Rendu | Lisibilité imprimée |
| --- | --- | --- | --- |
| [`sequence-signalement.puml`](sequence-signalement.puml) | Un citoyen signale un contenu suspect. | 668 × 673 | ~8,7 pt |
| [`sequence-prise-en-charge.puml`](sequence-prise-en-charge.puml) | Un journaliste ouvre une enquête sur un sujet. | 610 × 749 | ~9,5 pt |
| [`sequence-arbitrage.puml`](sequence-arbitrage.puml) | Le directeur arbitre, publie, renvoie ou annule. | 775 × 1838 | ~4,6 pt |

## Conventions

Chaque diagramme s'ouvre sur un fragment `ref` qui énonce ses **préconditions** :
ce qui doit déjà être vrai pour que le cas d'utilisation puisse démarrer.

Seuls les acteurs qui pilotent l'IHM ont une ligne de vie. Ceux qui subissent
les conséquences d'une décision — le journaliste notifié d'un renvoi, les
citoyens destinataires d'une publication — appartiennent au système et
n'apparaissent pas : leurs notifications sont des écritures en base.

La base de données est représentée en cylindre, distincte de l'application,
pour marquer qu'il s'agit d'un élément externe au code applicatif.

Dans `sequence-arbitrage`, la limite de trois tentatives de révision est une
**simplification délibérée** : elle sort rapidement de la boucle et rend le
diagramme lisible. La valeur réelle du garde-fou est portée par
`MAX_REVISION_ATTEMPTS`.

---

## Texte à insérer avec la figure d'arbitrage

> À coller sous la figure dans le document de soutenance.

### Cas de la validation ou du rejet par le directeur de publication

Le scénario suppose réunies quatre préconditions : une session valide, le rôle
de directeur de publication, un compte actif, et au moins une enquête en attente
de validation. Le directeur consulte d'abord la liste des enquêtes soumises,
puis en sélectionne une ; le système lui restitue alors le dossier complet,
comprenant les notes d'enquête du journaliste, les médias classés, les preuves
apportées par les vigies et le verdict provisoire proposé.

À l'issue de cet examen, la décision du directeur emprunte l'une de deux voies :
il valide le dossier, ou il le renvoie. Ces deux voies conduisent à quatre
issues.

- **Le directeur valide un verdict publiable** (vrai, faux ou trompeur). Une
  publication officielle est créée, que le directeur signe d'une note éditoriale
  et des pièces vérifiées qu'il retient. Le journaliste reçoit une notification
  personnelle, et la publication est diffusée à l'ensemble des citoyens de la
  plateforme : c'est le seul cas où la notification dépasse le cercle des
  contributeurs, puisqu'il s'agit précisément de porter l'information vérifiée
  au public.
- **Le directeur accepte le verdict « invérifiable »** proposé par le
  journaliste. L'enquête est archivée sans donner lieu à publication, et seuls
  les contributeurs directs sont informés : le journaliste, le citoyen auteur du
  signalement et les vigies ayant soumis une preuve.
- **Le directeur renvoie le dossier** en précisant un motif, obligatoire. C'est
  également la voie empruntée lorsqu'il refuse le verdict « invérifiable ». Le
  système enregistre la décision, incrémente le compteur de tentatives et
  notifie uniquement le journaliste, qui reprend son enquête et propose un
  nouveau verdict.
- **Le nombre maximal de tentatives est atteint.** L'enquête est définitivement
  annulée. Les contributeurs directs en sont informés et le créneau du
  journaliste est libéré, mais sans attribution de points, à la différence des
  trois autres issues.

Quelle que soit l'issue, l'application journalise systématiquement la décision —
auteur, statut précédent, motif — puis archive le sujet éditorial et le
signalement d'origine, et libère le créneau du journaliste afin qu'il puisse
prendre en charge un nouveau sujet.

Ce diagramme met en évidence le principe de notification retenu : les
contributeurs directs sont informés de toutes les décisions qui les concernent,
tandis que la diffusion à l'ensemble des citoyens est réservée au seul cas où
une information vérifiée est publiée.
