export const verificationThemes = [
  { value: 'Santé', label: 'Santé' },
  { value: 'Sécurité', label: 'Sécurité' },
  { value: 'Économie', label: 'Économie' },
  { value: 'Éducation', label: 'Éducation' },
  { value: 'Politique', label: 'Politique' },
  { value: 'Environnement', label: 'Environnement' },
  { value: 'Technologie', label: 'Technologie' },
  { value: 'Société', label: 'Société' },
  { value: 'Sport', label: 'Sport' },
  { value: 'International', label: 'International' },
] as const

export type VerificationTheme = (typeof verificationThemes)[number]['value']

export const defaultVerificationTheme: VerificationTheme =
  verificationThemes[0].value
