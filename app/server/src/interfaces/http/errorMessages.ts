/**
 * French user-facing messages for domain errors, keyed by the (English) message
 * carried by the thrown error. Resolved at the HTTP boundary (see
 * `toErrorResponse`); an unmapped message falls through unchanged, so internal
 * invariants that a normal client never triggers stay in English for debugging.
 */
export const frErrorMessages: Record<string, string> = {
  // Accounts & actors
  'A journalist with this email already exists':
    'Un journaliste utilisant cet e-mail existe déjà.',
  'Journalist email is required': "L'e-mail du journaliste est obligatoire.",
  'Journalist name is required': 'Le nom du journaliste est obligatoire.',
  'Director account is not active': "Le compte directeur n'est pas actif.",

  // Watcher applications & evidence
  'A watcher application is already pending or approved for this citizen':
    'Une candidature de vigie est déjà en attente ou approuvée pour ce citoyen.',
  'Cannot apply for watcher: not eligible':
    "Candidature vigie impossible : vous n'êtes pas éligible.",
  'Cannot promote: already a watcher or cannot apply':
    'Promotion impossible : déjà vigie ou candidature non autorisée.',
  'Citizen cannot apply for watcher: must be ACTIVE and REGULAR type':
    'Candidature vigie impossible : le compte doit être actif et de type citoyen régulier.',
  'Citizen is already a watcher': 'Ce citoyen est déjà vigie.',
  'Only active watchers can submit evidence':
    'Seules les vigies actives peuvent soumettre une preuve.',
  'Only watchers can submit evidence':
    'Seules les vigies peuvent soumettre une preuve.',
  'Evidence requires at least one media item':
    'Une preuve doit contenir au moins un média.',
  'Watcher evidence requires at least one media item':
    'Une preuve de vigie doit contenir au moins un média.',
  'Watcher evidence media must have category set by the journalist before review':
    'Le média de preuve de la vigie doit avoir une catégorie définie par le journaliste avant la revue.',
  'Watcher evidence media must have justification set by the journalist before review':
    'Le média de preuve de la vigie doit avoir une justification définie par le journaliste avant la revue.',
  'Watcher evidence media must have reliability set by the journalist before review':
    'Le média de preuve de la vigie doit avoir une fiabilité définie par le journaliste avant la revue.',

  // Reports & inbox subjects
  'Cannot submit report: maximum open reports reached or account inactive':
    'Signalement impossible : nombre maximal de signalements ouverts atteint ou compte inactif.',
  'Citizen cannot submit a new report (inactive or maximum reached)':
    "Impossible d'envoyer un nouveau signalement (compte inactif ou maximum atteint).",
  'Report does not contain enough information to build an inbox subject':
    "Le signalement ne contient pas assez d'informations pour créer un sujet.",
  'Inbox subject is archived': 'Le sujet est archivé.',
  'Inbox subject is not available for picking':
    "Ce sujet n'est pas disponible.",
  'Cannot start progress on archived subject':
    'Impossible de démarrer une enquête sur un sujet archivé.',
  'Cannot pick inbox subject: maximum active investigations reached':
    "Prise du sujet impossible : nombre maximal d'enquêtes actives atteint.",
  'Cannot delete a subject once an investigation has been opened on it. Archive it instead.':
    'Impossible de supprimer un sujet sur lequel une enquête a été ouverte. Archivez-le à la place.',

  // Investigation lifecycle
  'Investigation belongs to another journalist':
    'Cette enquête appartient à un autre journaliste.',
  'Cannot submit: investigation belongs to another journalist':
    'Soumission impossible : cette enquête appartient à un autre journaliste.',
  'Cannot correct: investigation belongs to another journalist':
    'Correction impossible : cette enquête appartient à un autre journaliste.',
  'Investigation cannot be edited in current status':
    "L'enquête ne peut pas être modifiée dans son statut actuel.",
  'Investigation cannot be canceled from a terminal status':
    "Impossible d'annuler une enquête dans un statut terminal.",
  'Investigation must have media category before submission':
    "L'enquête doit avoir une catégorie de média avant sa soumission.",
  'Cannot submit investigation for review':
    "Impossible de soumettre l'enquête à la revue.",
  'Investigation must be pending review to be approved':
    "L'enquête doit être en attente de revue pour être approuvée.",
  'Investigation must be pending review to be validated':
    "L'enquête doit être en attente de revue pour être validée.",
  'Investigation must be pending director review to be sent back for revision':
    "L'enquête doit être en attente de revue du directeur pour être renvoyée en révision.",
  'Investigation must be pending review with draft verdict UNVERIFIABLE to be archived by the director':
    "L'enquête doit être en attente de revue avec un verdict provisoire « invérifiable » pour être archivée par le directeur.",
  'Invalid status for rejection': 'Statut invalide pour un rejet.',
  'Publication approval requires a standard verdict (TRUE, FALSE, or MISLEADING); use archive flow for UNVERIFIABLE':
    "L'approbation d'une publication requiert un verdict standard (vrai, faux ou trompeur) ; utilisez l'archivage pour un contenu invérifiable.",
  'Corrections can only be published for published investigations':
    'Une correction ne peut être publiée que pour une enquête déjà publiée.',
  'Maximum correction attempts reached':
    'Nombre maximal de tentatives de correction atteint.',

  // Investigation & evidence media rules
  'Authority source is required': "Une source d'autorité est requise.",
  'Investigation mediaCategory is required when citizen or director-inbox source media exist':
    "La catégorie de média de l'enquête est requise lorsque des médias sources (citoyen ou directeur) existent.",
  'Each source investigation medium must have a category before review':
    "Chaque média source de l'enquête doit avoir une catégorie avant la revue.",
  'Each source investigation medium must have a justification before review':
    "Chaque média source de l'enquête doit avoir une justification avant la revue.",
  'Each source investigation medium must have a reliability verdict before review':
    "Chaque média source de l'enquête doit avoir un verdict de fiabilité avant la revue.",
  'Each journalist proof medium must reference an authority source before review':
    'Chaque média de preuve du journaliste doit référencer une source d’autorité avant la revue.',
  'JOURNALIST_PROOF requires an authority source':
    "Un média de preuve nécessite une source d'autorité.",
  'JOURNALIST_PROOF cannot define category, reliability, or justification':
    'Un média de preuve ne peut pas définir de catégorie, de fiabilité ni de justification.',
  'Journalist proof media cannot carry category, reliability, or justification':
    'Un média de preuve du journaliste ne peut porter ni catégorie, ni fiabilité, ni justification.',
  'Journalist can submit authority source only if origin = JOURNALIST_PROOF':
    "Le journaliste ne peut soumettre une source d'autorité que pour un média de preuve.",
  'Journalist can submit media category only for source media (citizen or director inbox)':
    'Le journaliste ne peut soumettre une catégorie que pour les médias sources (citoyen ou directeur).',
  'Journalist can submit justification only for source media (citizen or director inbox)':
    'Le journaliste ne peut soumettre une justification que pour les médias sources (citoyen ou directeur).',
  'Journalist can submit reliability verdict only for source media (citizen or director inbox)':
    'Le journaliste ne peut soumettre un verdict de fiabilité que pour les médias sources (citoyen ou directeur).',
  'Only citizen- or director-inbox-sourced media can be updated here':
    "Seuls les médias d'origine citoyen ou directeur peuvent être modifiés ici.",
}
