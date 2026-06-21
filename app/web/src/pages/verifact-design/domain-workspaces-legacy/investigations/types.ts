export type SourceMedia = {
  title: string
  type: string
  origin: 'CITIZEN_REPORT' | 'DIRECTOR_INITIATED'
  reliability: string
  category: string
  justification: string
}

export type JournalistProofMedia = {
  title: string
  type: string
  origin: 'JOURNALIST_PROOF'
  authoritySource: string
  sourceType: string
  url?: string
}

export type WatcherEvidenceItem = {
  title: string
  watcher: string
  media: string
  category?: string
  reliability?: string
  note: string
}

export type Dossier = {
  id: string
  title: string
  subject: string
  journalist: string
  status: string
  category: string
  verdict: string
  attempts: number
  updatedAt: string
  notes: string
}
