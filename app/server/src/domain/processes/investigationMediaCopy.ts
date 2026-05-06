// domain/processes/investigationMediaCopy.ts
// Build InvestigationMedia rows (id placeholders) copied from report or director inbox.

import type {
  ReportMedia,
  InboxSubjectMedia,
  InvestigationMedia,
} from '../value-objects/Media'
import { InvestigationMediaFactory } from '../factories/MediaFactory'

export type InvestigationMediaCopySource =
  | { type: 'REPORT'; rows: ReportMedia[] }
  | { type: 'INBOX_DIRECTOR'; rows: InboxSubjectMedia[] }

/** Uses id 0 as placeholder until persistence assigns real ids. */
export function copySourceMediaToInvestigationMedia(
  investigationId: string,
  source: InvestigationMediaCopySource,
): InvestigationMedia[] {
  if (source.type === 'REPORT') {
    return source.rows
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((row) =>
        InvestigationMediaFactory.createFromCitizenReport(
          0,
          row.order,
          row.url,
          row.type,
          investigationId,
          row.uploadedById,
        ),
      )
  }
  return source.rows
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((row) =>
      InvestigationMediaFactory.createFromDirectorInboxSource(
        0,
        row.order,
        row.url,
        row.type,
        investigationId,
        row.uploadedById,
      ),
    )
}
