# Diagrammes d'activité

| Fichier                                              | Contenu                                                  | Rendu      | Lisibilité imprimée |
| ---------------------------------------------------- | -------------------------------------------------------- | ---------- | ------------------- |
| [`activity-arbitrage.puml`](activity-arbitrage.puml) | Arbitrage d'une enquête par le directeur de publication. | 1012 × 984 | ~6 pt sur 17 cm     |

Source de vérité : `DirectorWorkflowService`, `InvestigationLifecycleService` et
`investigationStatusWorkflow`.

---

## Texte à insérer avec la figure

Le diagramme d'activité de la figure 9 illustre le processus d'arbitrage d'une
enquête par le Directeur de publication. Ce processus débute par la consultation
de la liste des enquêtes en attente de validation : seules y figurent celles que
le journaliste a soumises, au statut `PENDING_REVIEW`. Après sélection, le
Directeur ouvre le dossier et l'examine dans son ensemble — les notes d'enquête,
les médias sources classés par le journaliste, et les preuves apportées par les
Vigies.

À ce stade s'opère la bifurcation principale : le Directeur valide-t-il le
dossier en l'état, ou le renvoie-t-il à son auteur ?

### Premier cas : le Directeur renvoie le dossier

Le motif du renvoi est obligatoire ; sans lui, l'opération est refusée. Le
système journalise la décision, en conservant l'auteur, le statut précédent et
le motif. Une seconde bifurcation intervient alors, fondée sur le compteur de
tentatives de révision du dossier.

Tant que ce compteur reste sous le garde-fou anti-abus, l'enquête passe au
statut `NEEDS_REVISION` et le compteur est incrémenté. Le journaliste reçoit une
notification de ton WARNING. C'est également à ce moment, et uniquement à ce
moment, que le dossier s'ouvre aux contributions des Vigies : la rédaction
demande explicitement de la matière supplémentaire. Le journaliste corrige son
analyse et la resoumet, ce qui réamorce le processus depuis son début.

Si le garde-fou est atteint, l'enquête est annulée définitivement : elle passe au
statut `CANCELED`, le sujet éditorial et, le cas échéant, le signalement
d'origine sont archivés, le créneau du journaliste est libéré sans attribution de
points, et l'ensemble des parties prenantes est notifié. Le processus se termine.

### Second cas : le Directeur valide le dossier

Une troisième bifurcation distingue alors deux issues, selon le verdict proposé
par le journaliste.

Si ce verdict est « Invérifiable », l'enquête passe au statut `ARCHIVED`. Aucune
publication n'est créée : un dossier invérifiable n'est jamais publié. La
décision est journalisée, le sujet éditorial et le signalement d'origine sont
archivés, et le créneau du journaliste est libéré avec deux points d'engagement.
Seules les parties prenantes du dossier sont notifiées — le journaliste, les
Vigies ayant contribué, et le citoyen à l'origine du signalement lorsque
l'enquête en provient. Le processus se termine sur une enquête archivée, sans
publication.

Si le verdict est publiable — Vrai, Faux ou Trompeur — le Directeur saisit une
note éditoriale, obligatoire, et attache les pièces vérifiées qu'il souhaite
mettre en avant. Le système crée la publication officielle et fait passer
l'enquête au statut `PUBLISHED`. La décision est journalisée, le sujet éditorial
et le signalement d'origine sont archivés, et le créneau du journaliste est
libéré avec deux points d'engagement. Le journaliste est notifié de la
publication de son enquête, puis une notification est diffusée à chaque citoyen
de la plateforme, par lots de cinq cents afin que la diffusion reste maîtrisée
quelle que soit la taille de la communauté. Le processus se termine sur une
publication officielle diffusée.

Ainsi, ce diagramme couvre l'ensemble du processus d'arbitrage, depuis la
consultation des dossiers en attente jusqu'à la décision finale, en intégrant la
boucle de correction et le garde-fou qui l'empêche de tourner indéfiniment.
