CREATE TABLE "auth_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_links_userId_key" ON "auth_links"("userId");
CREATE UNIQUE INDEX "auth_links_actorId_key" ON "auth_links"("actorId");
CREATE INDEX "auth_links_actorId_idx" ON "auth_links"("actorId");

ALTER TABLE "auth_links"
ADD CONSTRAINT "auth_links_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_links"
ADD CONSTRAINT "auth_links_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "actors"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
