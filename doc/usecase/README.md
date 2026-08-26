# Cas d'utilisation

| Fichier                                            | Usage                                                                                                            | Rendu      | Lisibilité imprimée |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- | ------------------- |
| [`usecase-essentiel.puml`](usecase-essentiel.puml) | La figure du document. 13 cas regroupés plus `S'authentifier`, qu'ils incluent tous. Aucune note dans le dessin. | 994 × 1593 | ~5,3 pt sur A4      |

Les variantes `usecase-simple` et `usecase-full` ont été retirées : elles
étalaient les mêmes cas sur une surface illisible une fois imprimée. Leur
historique reste accessible dans git.

La lisibilité imprimée est calculée pour une figure occupant une page A4 portrait
(17 × 24,7 cm de zone utile).

---

## Texte à insérer avec la figure essentielle

> À coller sous la figure. Il porte ce que le dessin ne montre volontairement
> pas, pour rester lisible une fois imprimé.

### Portée et enchaînement

Hormis la sonde technique `GET /health`, tout cas d'utilisation exige une session
authentifiée valide : c'est ce que traduisent les treize relations «inclus» qui
convergent vers _S'authentifier_, et c'est pourquoi les trois rôles sont des
spécialisations d'un utilisateur déjà connecté. Le visiteur est le seul acteur
pour qui _S'authentifier_ est un but en soi et non une inclusion : il n'est pas
encore identifié, et c'est précisément ce qu'il vient faire. La vigie, elle, est
un citoyen promu après candidature approuvée par un directeur ; elle conserve
tous les cas d'utilisation du citoyen.

Les étapes s'enchaînent : _Soumettre l'enquête à validation_ suppose
_Ouvrir une enquête sur un sujet_, et _Arbitrer une enquête_ suppose la
soumission. _Publier un démenti_ étend l'arbitrage : c'est un prolongement
facultatif, déclenché seulement lorsqu'une publication déjà diffusée doit être
corrigée. _Contribuer à une enquête_ n'est possible que lorsque le directeur a
renvoyé le dossier en révision.

Trois règles encadrent ces cas : un citoyen ne peut pas dépasser trois
signalements ouverts ; un journaliste ne mène qu'une enquête active à la fois ;
la publication est réservée aux verdicts TRUE, FALSE ou MISLEADING, un verdict
UNVERIFIABLE étant archivé et non publié.

### Ce que recouvre chaque cas d'utilisation

Les 14 cas de la figure agrègent les 38 opérations exposées par l'API.

| Cas d'utilisation                       | Opérations couvertes                                                                                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consulter les publications              | Publications et leurs rectifications. Couvre aussi, selon les droits du rôle, la consultation des sujets éditoriaux et des enquêtes visibles.                                                                                                                       |
| Suivre ses notifications                | Consulter, marquer une notification comme lue, tout marquer comme lu.                                                                                                                                                                                               |
| Consulter son profil et son activité    | Profil, contributions, indicateurs personnels ; pour le directeur, tableau de bord de la rédaction et historique de ses décisions.                                                                                                                                  |
| Signaler un contenu suspect             | Dépôt du signalement et de ses médias.                                                                                                                                                                                                                              |
| Suivre l'avancement de ses signalements | Liste de ses propres signalements avec leur statut, et l'état du sujet éditorial correspondant : ouvert, en cours d'instruction, ou archivé. Le citoyen ne voit que les siens.                                                                                      |
| Postuler au rôle de vigie               | Dépôt d'une candidature motivée. La promotion effective dépend de la décision d'un directeur, elle n'est pas acquise par le dépôt.                                                                                                                                  |
| Contribuer à une enquête                | Preuve écrite et médias associés, sur une enquête renvoyée en révision.                                                                                                                                                                                             |
| Ouvrir une enquête sur un sujet         | Consulter la boîte de réception éditoriale et les signalements ouverts, ouvrir l'enquête, rédiger le brouillon (catégorie, verdict, notes), classer les médias sources et les médias de preuve vigie, ajouter des preuves journalistiques, corriger après révision. |
| Soumettre l'enquête à validation        | Envoi en revue directeur.                                                                                                                                                                                                                                           |
| Gérer la boîte à sujets                 | Créer un sujet d'origine directeur, supprimer un sujet et ses médias.                                                                                                                                                                                               |
| Arbitrer une enquête                    | Approuver et publier, renvoyer en révision, archiver un dossier invérifiable, annuler.                                                                                                                                                                              |
| Publier un démenti                      | Publier une rectification sur une publication déjà diffusée, et la notifier à ses destinataires.                                                                                                                                                                    |
| Gérer les utilisateurs                  | Créer un compte journaliste ; bannir, désactiver ou réactiver un journaliste ou un citoyen ; consulter, approuver ou rejeter les candidatures vigie.                                                                                                                |

Une seule opération n'est pas portée par la figure : le **balayage de
réconciliation du stockage**, qui supprime du bucket les médias devenus
orphelins. C'est une tâche de maintenance réservée au directeur, sans valeur
d'usage pour les autres rôles, volontairement écartée de cette vue.
