-- CreateTable
CREATE TABLE "press_assets" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "press_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "press_assets_isActive_order_idx" ON "press_assets"("isActive", "order");

-- AddForeignKey
ALTER TABLE "press_assets" ADD CONSTRAINT "press_assets_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
