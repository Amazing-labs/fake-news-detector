import type {
  Dossier,
  JournalistProofMedia,
  SourceGroup,
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
    'La séquence est authentique mais ancienne. Elle est republiée comme si elle documentait la situation actuelle.',
}

export const mockSourceGroups: SourceGroup[] = [
  {
    origin: 'CITIZEN_REPORT',
    submitterNote:
      "J'ai vu cette vidéo partagée sur plusieurs groupes WhatsApp ce matin avec la légende « opération en cours ». Elle semble ancienne mais circule comme si c'était aujourd'hui.",
    media: [
      {
        title: 'Séquence vidéo du signalement citoyen',
        type: 'VIDEO',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        origin: 'CITIZEN_REPORT',
        reliability: 'MISLEADING',
        category: 'CONTEXT_COLLAPSE',
        justification:
          "Les uniformes et le décor correspondent à une patrouille archivée, pas à l'événement actuel.",
      },
    ],
  },
  {
    origin: 'DIRECTOR_INITIATED',
    submitterNote:
      "Capture extraite d'un fil Twitter signalé par notre veille automatique. La date de publication ne correspond pas au contexte allégué.",
    media: [
      {
        title: 'Capture publiée par la direction éditoriale',
        type: 'IMAGE',
        url: 'https://picsum.photos/seed/mockdirector/1200/675',
        origin: 'DIRECTOR_INITIATED',
        reliability: 'UNVERIFIABLE',
        category: 'OTHER',
        justification:
          "La capture seule ne permet pas d'établir la date ni le lieu.",
      },
    ],
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
    media: [
      {
        url: 'https://picsum.photos/seed/awa1/800/600',
        type: 'IMAGE',
        category: 'CONTEXT_COLLAPSE',
        reliability: 'TRUE',
        justification:
          "Le panneau dans l'image correspond exactement au checkpoint archive de 2022.",
      },
      {
        url: 'https://picsum.photos/seed/awa2/800/600',
        type: 'IMAGE',
      },
    ],
    note: "Le panneau visible dans la vidéo correspond à l'ancien checkpoint.",
  },
  {
    title: 'Recherche de publication antérieure',
    watcher: 'Malik Sissoko',
    media: [
      {
        url: 'https://example.com/archive-2022-extrait',
        type: 'LINK',
        category: 'MISLEADING',
        reliability: 'TRUE',
        justification: 'Archive accessible, date de publication confirmee.',
      },
    ],
    note: 'Le même extrait circule déjà dans une archive de 2022.',
  },
]
