# Modèle Physique de Données (Merise)

| Fichier | Contenu | Rendu | Lisibilité imprimée |
| --- | --- | --- | --- |
| [`mpd-essentiel.puml`](mpd-essentiel.puml) | La figure du document. Les 10 tables du circuit éditorial. Aucune note dans le dessin. | 977 × 1416 | ~5,9 pt sur A4 |

La variante `mpd-simple`, qui dessinait les 22 tables du schéma, a été retirée :
à environ 2 pt elle n'était lisible sur aucune impression. Son historique reste
accessible dans git, et le schéma lui-même fait foi.

La vue essentielle couvre exactement le même périmètre que la vue fonctionnelle
du diagramme de classes : **10 tables pour 14 classes**, l'écart tenant au seul
héritage aplati d'`Acteur`, dont les quatre spécialisations partagent la table
`actors`. Les trois figures — cas d'utilisation, classes, MPD — se lisent donc
en regard, sur le même périmètre.

Le MPD est dérivé des migrations réellement appliquées
(`app/server/src/infrastructure/config/prisma/migrations/**`), pas du schéma
souhaité. Notation : clé primaire soulignée, clé étrangère préfixée par `#`,
`(O)` pour une colonne facultative, `(U)` pour une contrainte d'unicité.

---

## Légende à placer avec la figure

La figure ne porte plus de note, pour rester lisible une fois imprimée. Ce qui
suit tient sa place.

| Notation | Sens |
| --- | --- |
| <u>souligné</u> | Clé primaire. |
| `#` | Clé étrangère. |
| `(O)` | Colonne facultative, NULL autorisé. |
| `(U)` | Contrainte d'unicité. |
| Capitales sans guillemets | Type ENUM natif PostgreSQL (`Role`, `Verdict`, …). |

Chaque table porte en plus `createdAt` et, sauf le journal d'audit qui est
immuable, `updatedAt`. Ces colonnes techniques ne sont pas reprises sur la
figure.

**Héritage aplati.** Citoyen, Vigie, Journaliste et Directeur ne donnent pas
quatre tables : ils partagent `actors`, discriminée par la colonne `role`. C'est
la stratégie dite « table unique ». Les colonnes propres à un rôle
(`citizenType`, `openReportsCount`, `activeInvestigationsCount`) restent donc à
NULL ou à zéro pour les autres rôles.

**Hors périmètre de cette vue.** Les six tables de médias, le référentiel des
sources d'autorité et les cinq tables d'authentification. Aucune ne porte de cas
d'utilisation propre. Le schéma complet fait foi :
`app/server/src/infrastructure/config/prisma/models/`.

---

## Couverture des cas d'utilisation

Les 14 cas du diagramme de cas d'utilisation, et les tables qui les portent.

| Cas d'utilisation | Tables concernées |
| --- | --- |
| S'authentifier | `actors` (`status`) — via les tables d'authentification, hors périmètre |
| Consulter les publications | `publications`, `Correction` |
| Suivre ses notifications | `notifications` (`isRead`) |
| Consulter son profil et son activité | `actors` (`engagementScore`), `workflow_audits` |
| Signaler un contenu suspect | `reports` |
| Suivre l'avancement de ses signalements | `reports` (`status`), `inbox_subjects` (`status`) |
| Postuler au rôle de vigie | `watcher_applications` |
| Contribuer à une enquête | `evidence` |
| Ouvrir une enquête sur un sujet | `inbox_subjects`, `investigations` |
| Soumettre l'enquête à validation | `investigations` (`status`) |
| Arbitrer une enquête | `investigations` (`status`, `attemptCount`), `workflow_audits`, `publications` |
| Publier un démenti | `Correction`, `publications` (`isCorrection`), `notifications` |
| Gérer la boîte à sujets | `inbox_subjects` (`origin`, `status`) |
| Gérer les utilisateurs | `actors` (`status`), `watcher_applications` (`status`) |

Le cadrage est strict, dans les deux sens : toute table présente porte au moins
un cas d'utilisation, et tout cas d'utilisation trouve au moins une table.

---

## Texte à insérer avant le MPD

> Le texte ci-dessous est rédigé pour être collé tel quel dans le document de
> soutenance, juste avant le schéma.

### Pourquoi Merise pour le modèle physique de données

Le diagramme de classes décrit un modèle **objet** : héritage, composition,
objets-valeurs, méthodes portant les règles métier. Le modèle physique décrit un
modèle **relationnel** : des tables, des colonnes typées, des clés et des
contraintes. Les deux ne parlent pas de la même chose, et le passage de l'un à
l'autre n'est pas une traduction mécanique.

UML n'interdit pas ce passage : des profils existent — le *UML Data Modeling
Profile*, l'*Information Management Metamodel* de l'OMG — et tout ORM en réalise
une version au quotidien. Mais aucune de ces voies n'est **normative**. Le
standard UML ne désigne aucune transformation unique vers le relationnel, et il
laisse surtout ouvertes les décisions qui déterminent le schéma final. Trois
exemples tirés de ce projet :

- **L'héritage.** `Citoyen`, `Vigie`, `Journaliste` et `Directeur` spécialisent
  `Acteur`.
  Le relationnel ignore l'héritage : il faut arbitrer entre une table unique avec
  discriminant, une table par classe, ou une table par classe concrète. Les trois
  sont correctes, elles ne produisent pas le même schéma, et UML n'en impose
  aucune. Le choix retenu ici est la table unique `actors`, discriminée par la
  colonne `role` : c'est ce qui explique que quatre classes d'acteurs ne donnent
  qu'une seule table.
- **Les objets-valeurs.** Un média est une notion unique côté métier. Côté base,
  ce sont six tables distinctes, chacune rattachée à un conteneur différent et
  portant des colonnes différentes.
- **Les tables sans classe.** `auth_links` ne correspond à aucune classe du
  modèle objet. C'est une table de raccordement, en un-à-un strict des deux
  côtés, entre le compte d'authentification (`user`, géré par better-auth) et
  l'acteur métier (`actors`). Elle n'existe que parce que deux référentiels
  d'identité doivent cohabiter dans une même base : une préoccupation purement
  physique, par construction absente du diagramme de classes.

Merise, à l'inverse, est conçu pour la donnée et non pour l'objet. Sa chaîne de
dérivation est formalisée et **déterministe** : MCD → MLD → MPD, avec des règles
explicites — une entité devient une table ; une association de type 1:N reporte
la clé du côté 1 vers le côté N ; une association N:M devient une table de
jonction ; une cardinalité minimale à 0 rend la clé étrangère facultative. Deux
personnes parties du même MCD aboutissent au même MPD. C'est cette
reproductibilité qui rend le modèle **auditable** : chaque table, chaque clé
étrangère, chaque colonne nullable du schéma qui suit se justifie par une règle
de dérivation, et non par une préférence d'implémentation.

Les deux formalismes sont donc employés pour ce qu'ils savent faire, et non l'un
à la place de l'autre : **UML pour le modèle objet**, celui que le code
implémente ; **Merise pour le modèle de données**, celui que la base implémente.

Aucun des deux ne dit tout, du reste. Une règle comme « un média d'origine
`JOURNALIST_PROOF` exige une source d'autorité et interdit tout classement »
n'est exprimable ni par une classe ni par une contrainte de schéma : elle est
portée par la couche domaine, et le MPD se contente d'autoriser les deux formes.

---

## Points connus du schéma

À traiter, ou à savoir expliquer si la question est posée en soutenance.

### `_NotificationToVerifiedMedia` et `_NotificationToVerifiedLink`

**Ces deux tables existent en base mais ne figurent sur aucun schéma.** La base
compte 24 tables : les 22 modèles déclarés dans le schéma Prisma, plus ces deux
tables de jonction générées implicitement. Elles sont vides et inutilisées. Ce
paragraphe existe pour que l'écart soit tracé et non caché : si la question est
posée, voici la réponse.

Ces deux tables de jonction sont **vides et inutilisées**. Elles proviennent
d'une relation plusieurs-à-plusieurs implicite : `Notification` déclare
`verifiedMedia VerifiedMedia[]` et `verifiedLinks VerifiedLink[]`, tandis que
`VerifiedMedia` et `VerifiedLink` déclarent en retour `notifications
Notification[]`. Les deux côtés étant des listes sans `fields`/`references`,
Prisma en déduit un plusieurs-à-plusieurs et crée les tables de jonction
correspondantes, à clé primaire composite `(A, B)`.

Or aucun code applicatif ne les lit ni ne les écrit : ni le
`PrismaNotificationRepository`, ni aucun service. Le lien entre une notification
et une publication passe uniquement par la colonne `notifications.publicationId`.
Ces deux tables sont donc du poids mort, vraisemblablement introduit en ajoutant
une relation inverse sans intention de l'exploiter.

**Recommandation, à traiter après la soutenance** : supprimer les quatre
déclarations de relation concernées et générer une migration de suppression. Le
schéma perd deux tables, l'application ne perd rien. Rien n'a été modifié dans
le code pour l'instant, par choix : on ne touche pas à l'application à
l'approche de la soutenance.
