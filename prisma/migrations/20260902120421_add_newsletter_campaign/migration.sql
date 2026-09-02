-- CreateTable
CREATE TABLE "newsletter_campaigns" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "introText" TEXT NOT NULL,
    "articleId" TEXT,
    "recipientCount" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentById" TEXT,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
