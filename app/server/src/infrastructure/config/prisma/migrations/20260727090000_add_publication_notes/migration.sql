-- AlterTable: the editorial statement the director signs off when approving a
-- dossier. Required going forward; existing rows are backfilled with an empty
-- statement, then the default is dropped so new inserts must supply one.
ALTER TABLE "publications" ADD COLUMN "publicationNotes" TEXT NOT NULL DEFAULT '';

ALTER TABLE "publications" ALTER COLUMN "publicationNotes" DROP DEFAULT;
