export const inboxSubjects = [
  {
    theme: "Crise d'essence",
    origin: 'Signalement citoyen',
    status: 'OPEN',
    owner: 'Non assigne',
    description:
      "Rumeurs autour d'une origine djihadiste de la pénurie de carburant.",
  },
  {
    theme: 'Video de checkpoint',
    origin: 'Création direction',
    status: 'IN_PROGRESS',
    owner: 'Maimouna Traore',
    description:
      "Vérifier le lieu, la date et l'unité présente dans la séquence.",
  },
  {
    theme: 'Prix du mil',
    origin: 'Signalement citoyen',
    status: 'OPEN',
    owner: 'Non assigne',
    description: 'Comparer les chiffres publies avec les releves officiels.',
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
