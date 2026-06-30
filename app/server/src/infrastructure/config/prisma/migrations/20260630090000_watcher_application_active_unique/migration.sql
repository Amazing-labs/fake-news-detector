-- Enforce at most one ACTIVE (pending or approved) watcher application per actor
-- at the database level, closing the read-then-write race in the application
-- service (two concurrent submissions could otherwise both insert a PENDING
-- row). Multiple REJECTED rows remain allowed, preserving the full history.
--
-- Note: Prisma's PSL cannot model a partial (filtered) unique index, so this is
-- a hand-written migration not reflected in schema.prisma.
CREATE UNIQUE INDEX "watcher_applications_active_actor_key"
  ON "watcher_applications" ("actorId")
  WHERE "status" IN ('PENDING', 'APPROVED');
