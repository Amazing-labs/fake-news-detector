# Diagrammes de classes

| Fichier                                            | Usage                                                                                                        | Rendu       | Lisibilité imprimée |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------- | ------------------- |
| [`class-fonctionnel.puml`](class-fonctionnel.puml) | La figure du document. 14 classes, une responsabilité par classe : le miroir exact des 14 cas d'utilisation. | 1113 × 1613 | ~5,2 pt sur A4      |

Les variantes qui l'accompagnaient — `class-essentiel`, `class-simple`,
`class-domain`, `class-services` — ont été retirées : elles redisaient ce
contenu à une taille qu'aucune impression ne résolvait. Leur historique reste
accessible dans git.

La lisibilité est calculée pour une figure occupant une page A4 portrait
(17 × 24,7 cm de zone utile).

---

## Conventions de lecture

| Tracé                         | Sens                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Triangle creux                | Généralisation : la sous-classe est une spécialisation de la classe mère.                                     |
| Trait plein                   | Association : un lien durable entre deux entités, avec ses multiplicités.                                     |
| Trait plein à losange plein   | Composition : la partie n'existe pas sans le tout et disparaît avec lui.                                      |
| Trait pointillé `«crée»`      | L'acteur a le droit de faire naître l'entité, mais c'est l'entité qui porte la logique de sa propre création. |
| Trait pointillé `«déclenche»` | L'acteur provoque un changement d'état sur une entité qui existe déjà.                                        |

Les deux stéréotypes en pointillé traduisent la règle « une classe, une
responsabilité » : un citoyen _peut_ signaler, mais il ne sait pas _comment_ on
crée un signalement — cette logique appartient à `Signalement`. L'acteur ne
porte donc que ses droits (`peutSignaler()`, `peutArbitrer()`), et le pointillé
désigne l'entité qui sait faire.

---

## Couverture des cas d'utilisation

Les 14 cas du diagramme de cas d'utilisation, et les classes qui les portent.

| Cas d'utilisation                       | Classes concernées                                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S'authentifier                          | `Acteur` : `statut`, `estActif()`                                                                                                                                         |
| Consulter les publications              | `Acteur.consulterPublication()` → `Publication`                                                                                                                           |
| Suivre ses notifications                | `Acteur.suivreSesNotification()` → `Notification.marquerCommeLue()`                                                                                                       |
| Consulter son profil et son activité    | `Acteur.consulterProfil()`, `scoreEngagement`, `scoreArbitrage`                                                                                                           |
| Signaler un contenu suspect             | `Citoyen.peutSignaler()` `«crée»` `Signalement.deposer()`                                                                                                                 |
| Suivre l'avancement de ses signalements | `Signalement.statut`, association _alimente_ → `SujetBoiteReception.statut`                                                                                               |
| Postuler au rôle de vigie               | `Citoyen.peutPostulerVigie()` `«crée»` `CandidatureVigie.deposer()`                                                                                                       |
| Contribuer à une enquête                | `Vigie.peutContribuer()` `«crée»` `Preuve.apporter()`                                                                                                                     |
| Ouvrir une enquête sur un sujet         | `Journaliste.peutMenerEnquete()`, `SujetBoiteReception.estDisponible()` / `marquerPrisEnCharge()`, `Enquete.ouvrirSurSujet()` / `enregistrerBrouillon()`                  |
| Soumettre l'enquête à validation        | `Journaliste` `«déclenche»` `Enquete.soumettrePourRevue()`                                                                                                                |
| Arbitrer une enquête                    | `Directeur.peutArbitrer()` `«déclenche»` `Enquete.approuver()` / `demanderRevision()` / `archiver()` / `annuler()`, `JournalAudit.enregistrer()`, `Publication.publier()` |
| Publier un démenti                      | `Directeur` `«crée»` `Rectification.rectifier()`, `Publication.estCorrection`, `Notification` _porte_ la rectification                                                    |
| Gérer la boîte à sujets                 | `Directeur` `«crée, déclenche»` `SujetBoiteReception.ouvrirParDirecteur()` / `supprimerSujet()` / `archiver()`                                                            |
| Gérer les utilisateurs                  | `Acteur.gererUtilisateurs()`, `Directeur` `«déclenche»` `Acteur`, `CandidatureVigie.approuver()` / `rejeter()`                                                            |

---

## Ce que la vue fonctionnelle simplifie

Le diagramme a été resserré pour rester lisible une fois imprimé. Quatre
partis pris, à connaître si la question est posée :

- **Les paramètres des méthodes ne sont pas écrits.** `deposer()` plutôt que
  `deposer(citoyen, theme, titre, contenu)`. Les signatures réelles sont dans
  `app/server/src/domain/`.
- **Un acteur n'est relié qu'en pointillé à ce qu'il crée.** L'association
  pleine ferait doublon avec le `«crée»`. Les règles de plafond qu'elle portait
  survivent en attributs : `maxSignalementsOuverts = 3`,
  `maxEnquetesActives = 1`.
- **Les médias ne sont pas représentés.** Aucun cas d'utilisation ne porte sur
  eux : ils sont une pièce jointe des signalements, des enquêtes, des preuves et
  des publications. Les six tables correspondantes figurent au modèle physique
  de données, dans [`../mpd/`](../mpd/).
- **Les méthodes de mécanique interne sont omises** : compteurs, scores,
  libération de créneau, archivage en cascade. Elles ne correspondent à aucun
  cas d'utilisation.

Le cadrage est strict : toute classe présente porte au moins un cas
d'utilisation, et tout cas d'utilisation trouve au moins une classe. Le tableau
ci-dessus est la vérification de cette double couverture.
