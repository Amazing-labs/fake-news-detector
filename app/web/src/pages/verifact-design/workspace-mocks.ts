export const inboxSubjects = [
  {
    theme: "Crise d'essence",
    origin: 'Signalement citoyen',
    status: 'OPEN',
    owner: 'Non assigne',
    description:
      "Rumeurs autour d'une origine djihadiste de la pénurie de carburant.",
    media: [
      {
        name: 'Photo de la station vide',
        type: 'IMAGE' as const,
        url: '#photo-station',
        imageUrl:
          'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=1200&q=80',
        alt: 'Station essence avec files d attente',
        size: '340 Ko',
      },
      {
        name: 'Capture message viral',
        type: 'IMAGE' as const,
        url: '#capture-message',
        imageUrl:
          'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80',
        alt: 'Message circulant sur les reseaux',
        size: '210 Ko',
      },
      {
        name: 'Témoignage audio du signalant',
        type: 'AUDIO' as const,
        url: '#temoignage-audio',
        audioUrl:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
        size: '512 Ko',
      },
      {
        name: 'Note terrain du signalant.pdf',
        type: 'DOCUMENT' as const,
        url: '#note-terrain',
        size: '128 Ko',
      },
    ],
  },
  {
    theme: 'Video de checkpoint',
    origin: 'Création direction',
    status: 'IN_PROGRESS',
    owner: 'Maimouna Traore',
    description:
      "Vérifier le lieu, la date et l'unité présente dans la séquence.",
    media: [
      {
        name: 'Séquence checkpoint partagée',
        type: 'VIDEO' as const,
        url: '#sequence-checkpoint',
        videoUrl:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        posterUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        size: '4,2 Mo',
      },
      {
        name: 'Capture localisation revendiquee',
        type: 'IMAGE' as const,
        url: '#capture-localisation',
        imageUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
        alt: 'Lieu revendique dans la video',
        size: '185 Ko',
      },
    ],
  },
  {
    theme: 'Prix du mil',
    origin: 'Signalement citoyen',
    status: 'OPEN',
    owner: 'Non assigne',
    description: 'Comparer les chiffres publies avec les releves officiels.',
    media: [
      {
        name: 'Tableau des prix du marche.pdf',
        type: 'DOCUMENT' as const,
        url: '#tableau-prix',
        size: '96 Ko',
      },
      {
        name: 'Photo du panneau de prix',
        type: 'IMAGE' as const,
        url: '#photo-panneau',
        imageUrl:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        alt: 'Panneau de prix affiche au marche',
        size: '275 Ko',
      },
    ],
  },
]

export const reports = [
  {
    title: "Crise d'essence",
    theme: 'Securite',
    status: 'OPEN',
    reporter: 'Malik Sissoko',
    content:
      'Une rumeur locale relie la pénurie à un groupe armé sans source directe.',
  },
  {
    title: 'Prix du mil',
    theme: 'Economie',
    status: 'OPEN',
    reporter: 'Awa Diarra',
    content:
      'Les prix annonces sur les reseaux ne correspondent pas au releve officiel.',
  },
  {
    title: 'Alerte archivée',
    theme: 'Sante',
    status: 'ARCHIVED',
    reporter: 'Oumar Keita',
    content: 'Doublon d un signalement deja transforme en sujet.',
  },
]

export const investigations = [
  {
    title: 'Video de checkpoint',
    status: 'PENDING_REVIEW',
    category: 'Contexte trompeur',
    verdict: 'MISLEADING',
    journalist: 'Maimouna Traore',
    evidence: '3 medias classes',
  },
  {
    title: "Crise d'essence",
    status: 'IN_PROGRESS',
    category: 'Source insuffisante',
    verdict: 'UNVERIFIABLE',
    journalist: 'Ibrahim Diallo',
    evidence: '2 sources terrain',
  },
  {
    title: 'Prix du mil',
    status: 'NEEDS_REVISION',
    category: 'Chiffre public',
    verdict: 'TRUE',
    journalist: 'Maimouna Traore',
    evidence: 'Retour direction',
  },
  {
    title: 'Date de publication virale',
    status: 'PUBLISHED',
    category: 'Archive retrouvee',
    verdict: 'MISLEADING',
    journalist: 'Cellule preuves',
    evidence: 'Publication originale',
  },
]

export const notificationItems = [
  {
    id: 'publication-disponible',
    type: 'PUBLICATION',
    theme: 'Publication disponible',
    message: 'Le dossier checkpoint est maintenant publié avec son verdict.',
    isRead: false,
    publicationId: 'la-video-du-checkpoint-date-de-2022',
    investigationId: null,
  },
  {
    id: 'correctif-publie',
    type: 'CORRECTION',
    theme: 'Correctif publié',
    message: 'Une publication a été corrigée après nouvelle validation.',
    isRead: false,
    publicationId: 'correction-sur-le-prix-du-mil',
    investigationId: null,
  },
  {
    id: 'dossier-archive',
    type: 'ARCHIVED_PUBLICATION',
    theme: 'Dossier archivé',
    message: 'Une enquête non vérifiable a été archivée par la direction.',
    isRead: true,
    publicationId: null,
    investigationId: 'crise-essence',
  },
  {
    id: 'action-requise',
    type: 'ALERT',
    theme: 'Action requise',
    message: 'Une preuve ou une révision attend ton intervention.',
    isRead: true,
    publicationId: null,
    investigationId: null,
  },
] as const

export const publications = [
  {
    title: 'La video du checkpoint date de 2022',
    verdict: 'MISLEADING',
    type: 'Publication',
    evidence: '3 liens verifies',
    summary:
      "La séquence est authentique, mais elle ne documente pas l'événement récent mentionné dans les publications virales. Le journaliste a retrouvé la publication originale et recoupé la date avec des archives et des sources de contexte.",
    verifiedLinks: [
      {
        label: 'Publication originale archivée',
        url: 'https://example.org/archive/checkpoint-2022',
        description: 'Archive de la séquence publiée en 2022.',
      },
      {
        label: 'Contexte daté par la rédaction',
        url: 'https://example.org/fact-check/checkpoint-context',
        description: 'Chronologie utilisee pour verifier la date.',
      },
      {
        label: 'Source locale recoupée',
        url: 'https://example.org/source/checkpoint-location',
        description: 'Élément de contexte sur le lieu de la séquence.',
      },
    ],
    finalDocuments: [
      {
        name: 'Note de verification finale.pdf',
        type: 'PDF',
        size: '248 Ko',
        url: '#note-verification-finale',
      },
      {
        name: 'Journal des sources.csv',
        type: 'CSV',
        size: '18 Ko',
        url: '#journal-sources',
      },
    ],
    verifiedMedia: [
      {
        name: 'Capture publication originale',
        type: 'Image',
        url: '#capture-publication-originale',
        imageUrl:
          'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
        alt: 'Journal et notes de verification',
      },
      {
        name: 'Extrait video compare',
        type: 'Video',
        url: '#extrait-video-compare',
        posterUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        videoUrl:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      },
    ],
  },
  {
    title: 'Correction sur le prix du mil',
    verdict: 'TRUE',
    type: 'Correctif',
    evidence: '1 source officielle',
    summary:
      'Le correctif confirme les chiffres officiels et remplace une estimation partagee sans source primaire.',
    verifiedLinks: [
      {
        label: 'Releve officiel du marche',
        url: 'https://example.org/source/prix-du-mil',
        description: 'Source officielle utilisee pour corriger la publication.',
      },
    ],
    finalDocuments: [
      {
        name: 'Correctif publié.pdf',
        type: 'PDF',
        size: '112 Ko',
        url: '#correctif-publie',
      },
    ],
    verifiedMedia: [
      {
        name: 'Photo du releve officiel',
        type: 'Image',
        url: '#photo-releve-officiel',
        imageUrl:
          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
        alt: 'Documents administratifs verifies',
      },
    ],
  },
  {
    title: 'Archive : origine de la pénurie non vérifiable',
    verdict: 'UNVERIFIABLE',
    type: 'Archive',
    evidence: 'Dossier insuffisant',
    summary:
      "Les éléments disponibles ne permettent pas d'attribuer l'origine de la pénurie à une source fiable.",
    verifiedLinks: [],
    finalDocuments: [
      {
        name: 'Decision archivage.pdf',
        type: 'PDF',
        size: '96 Ko',
        url: '#decision-archivage',
      },
    ],
    verifiedMedia: [],
  },
]
