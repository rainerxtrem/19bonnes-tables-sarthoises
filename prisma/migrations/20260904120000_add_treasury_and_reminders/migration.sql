-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TRESORIER';

-- CreateEnum
CREATE TYPE "GiftVoucherPayoutStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "gift_vouchers" ADD COLUMN     "payoutStatus" "GiftVoucherPayoutStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paidByUserId" TEXT,
ADD COLUMN     "reminder3moSentAt" TIMESTAMP(3),
ADD COLUMN     "reminder1moSentAt" TIMESTAMP(3),
ADD COLUMN     "reminder7dSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "gift_vouchers_redeemedAtRestaurantId_payoutStatus_idx" ON "gift_vouchers"("redeemedAtRestaurantId", "payoutStatus");

-- AddForeignKey
ALTER TABLE "gift_vouchers" ADD CONSTRAINT "gift_vouchers_paidByUserId_fkey" FOREIGN KEY ("paidByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
