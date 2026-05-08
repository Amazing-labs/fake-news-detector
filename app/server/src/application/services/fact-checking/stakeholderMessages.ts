export function archivedUnverifiableMessageForStakeholder(
  actorId: string,
  journalistId: string,
  reportingCitizenId: string | null,
): string {
  if (actorId === journalistId) {
    return 'Votre enquête a été archivée (verdict invérifiable accepté).'
  }
  if (reportingCitizenId && actorId === reportingCitizenId) {
    return 'Votre signalement associé a été archivé (verdict invérifiable).'
  }
  return 'Une enquête à laquelle vous avez contribué en tant que vigie a été archivée (verdict invérifiable).'
}

export function canceledMessageForStakeholder(
  actorId: string,
  journalistId: string,
  reportingCitizenId: string | null,
  automatic: boolean,
): string {
  let subject: string
  let pastParticiple: string

  if (actorId === journalistId) {
    subject = 'Votre enquête'
    pastParticiple = 'annulée'
  } else if (reportingCitizenId && actorId === reportingCitizenId) {
    subject = 'Votre signalement associé'
    pastParticiple = 'annulé'
  } else {
    subject = 'Une enquête à laquelle vous avez contribué en tant que vigie'
    pastParticiple = 'annulée'
  }

  const reason = automatic
    ? "automatiquement en raison d'un nombre excessif de tentatives de révision (risque d'attaque DoS)"
    : 'par le directeur de publication'

  return `${subject} a été ${pastParticiple} ${reason}.`
}
