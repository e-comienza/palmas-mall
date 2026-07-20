-- CreateEnum
CREATE TYPE "PopupMode" AS ENUM ('SIMPLE', 'EVENT_CAROUSEL');

-- AlterTable
ALTER TABLE "Popup" ADD COLUMN     "eventIds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "mode" "PopupMode" NOT NULL DEFAULT 'SIMPLE';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "rentalWhatsapp" TEXT NOT NULL DEFAULT '573152842989',
ADD COLUMN     "sponsorPdfUrl" TEXT NOT NULL DEFAULT 'https://palmasmall.com/wp-content/uploads/2026/04/sponsors-palmas-mall-2026.pdf',
ADD COLUMN     "sponsorVideoUrl" TEXT NOT NULL DEFAULT 'https://palmasmall.com/wp-content/uploads/2026/01/video-brochure.mp4',
ADD COLUMN     "sponsorWhatsapp" TEXT NOT NULL DEFAULT '573155711045',
ADD COLUMN     "whatsappBubbleEnabled" BOOLEAN NOT NULL DEFAULT true;
