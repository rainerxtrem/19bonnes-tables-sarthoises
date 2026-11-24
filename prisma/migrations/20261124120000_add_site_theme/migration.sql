-- CreateEnum
CREATE TYPE "SiteTheme" AS ENUM ('NORMAL', 'NOEL', 'NOUVEL_AN', 'PAQUES', 'SAINT_VALENTIN');

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "themeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "siteTheme" "SiteTheme" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "themeEffects" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "themeBannerText" TEXT;
