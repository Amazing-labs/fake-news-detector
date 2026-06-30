-- Allow a citizen to keep a full history of watcher applications: drop the
-- unique constraint on actorId (one row per actor) and replace it with a plain
-- index. The "only one active application at a time" rule is enforced in the
-- application service.
DROP INDEX "watcher_applications_actorId_key";

CREATE INDEX "watcher_applications_actorId_idx" ON "watcher_applications"("actorId");
