-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'RESTAURATEUR';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "restaurantId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
