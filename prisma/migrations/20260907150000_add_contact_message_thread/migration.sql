-- CreateEnum
CREATE TYPE "ContactMessageReplyDirection" AS ENUM ('STAFF', 'CLIENT');

-- CreateTable
CREATE TABLE "contact_message_replies" (
    "id" TEXT NOT NULL,
    "contactMessageId" TEXT NOT NULL,
    "direction" "ContactMessageReplyDirection" NOT NULL,
    "body" TEXT NOT NULL,
    "authorUserId" TEXT,
    "resendEmailId" TEXT,
    "fromEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_message_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_message_replies_resendEmailId_key" ON "contact_message_replies"("resendEmailId");

-- CreateIndex
CREATE INDEX "contact_message_replies_contactMessageId_createdAt_idx" ON "contact_message_replies"("contactMessageId", "createdAt");

-- AddForeignKey
ALTER TABLE "contact_message_replies" ADD CONSTRAINT "contact_message_replies_contactMessageId_fkey" FOREIGN KEY ("contactMessageId") REFERENCES "contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_message_replies" ADD CONSTRAINT "contact_message_replies_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reprise des réponses déjà envoyées avant l'introduction du fil de
-- discussion (une seule réponse "staff" conservée par message, voir
-- l'ancien champ ContactMessage.replyMessage) : réinjectées comme premier
-- message du fil, avec un id dérivé (déterministe, pas de dépendance à une
-- extension Postgres pour générer un uuid).
INSERT INTO "contact_message_replies" ("id", "contactMessageId", "direction", "body", "authorUserId", "createdAt")
SELECT 'legacy-' || "id", "id", 'STAFF', "replyMessage", "repliedByUserId", COALESCE("repliedAt", CURRENT_TIMESTAMP)
FROM "contact_messages"
WHERE "replyMessage" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "contact_messages" DROP CONSTRAINT "contact_messages_repliedByUserId_fkey";

-- AlterTable
ALTER TABLE "contact_messages" DROP COLUMN "repliedAt",
DROP COLUMN "replyMessage",
DROP COLUMN "repliedByUserId";
