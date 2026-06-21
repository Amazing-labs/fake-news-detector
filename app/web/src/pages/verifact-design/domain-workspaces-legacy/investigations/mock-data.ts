import type {
  Dossier,
  JournalistProofMedia,
  SourceMedia,
  WatcherEvidenceItem,
} from './types'

export const mockDossier: Dossier = {
  id: 'selection-courante',
  title: 'Vidéo de checkpoint sortie de contexte',
  subject: "Vérifier le lieu, la date et l'unité présente dans la séquence.",
  journalist: 'Maimouna Traoré',
  status: 'PENDING_REVIEW',
  category: 'CONTEXT_COLLAPSE',
  verdict: 'MISLEADING',
  attempts: 1,
  updatedAt: '16 mai 2026, 18:40',
  notes:
    "La séquence est authentique mais ancienne. Elle est republiée comme si elle documentait la situation actuelle.",
}

export const mockSourceMedia: SourceMedia[] = [
  {
    title: 'Séquence vidéo du signalement citoyen',
    type: 'VIDEO',
    origin: 'CITIZEN_REPORT',
    reliability: 'MISLEADING',
    category: 'CONTEXT_COLLAPSE',
    justification:
      "Les uniformes et le décor correspondent à une patrouille archivée, pas à l'événement actuel.",
  },
  {
    title: 'Capture publiée par la direction éditoriale',
    type: 'IMAGE',
    origin: 'DIRECTOR_INITIATED',
    reliability: 'UNVERIFIABLE',
    category: 'OTHER',
    justification:
      "La capture seule ne permet pas d'établir la date ni le lieu.",
  },
]

export const mockJournalistProofMedia: JournalistProofMedia[] = [
  {
    title: 'Archive Bellingcat — checkpoint 2022',
    type: 'LINK',
    origin: 'JOURNALIST_PROOF',
    url: 'https://example.com/archive-2022',
    authoritySource: 'Bellingcat',
    sourceType: 'MEDIA_CROSSCHECK',
  },
  {
    title: 'Déclaration officielle des forces armées',
    type: 'DOCUMENT',
    origin: 'JOURNALIST_PROOF',
    authoritySource: 'Ministère de la Défense',
    sourceType: 'OFFICIAL_DECREE',
  },
]

export const mockWatcherEvidence: WatcherEvidenceItem[] = [
  {
    title: 'Comparaison du décor filmé',
    watcher: 'Awa Diarra',
    media: '2 images',
    category: 'CONTEXT_COLLAPSE',
    reliability: 'TRUE',
    note: "Le panneau visible dans la vidéo correspond à l'ancien checkpoint.",
  },
  {
    title: 'Recherche de publication antérieure',
    watcher: 'Malik Sissoko',
    media: '1 lien',
    category: 'MISLEADING',
    reliability: 'TRUE',
    note: 'Le même extrait circule déjà dans une archive de 2022.',
  },
]
