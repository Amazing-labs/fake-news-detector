-- The previous migration backfilled existing publications with an empty note,
-- which reads as "signed with nothing to say" rather than "never signed". Make
-- the absence representable and restore it, so the invariant becomes the true
-- one: every publication created since the rule carries a signed statement.

-- AlterTable
ALTER TABLE "publications" ALTER COLUMN "publicationNotes" DROP NOT NULL;

-- Turn the empty backfill back into a real absence.
UPDATE "publications"
SET "publicationNotes" = NULL
WHERE btrim("publicationNotes") = '';
