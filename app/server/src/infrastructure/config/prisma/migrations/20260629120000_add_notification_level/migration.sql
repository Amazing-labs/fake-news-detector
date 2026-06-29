-- CreateEnum
CREATE TYPE "NotificationLevel" AS ENUM ('SUCCESS', 'WARNING', 'INFO');

-- AlterTable: visual tone (severity) orthogonal to the notification type.
ALTER TABLE "notifications" ADD COLUMN "level" "NotificationLevel" NOT NULL DEFAULT 'INFO';
