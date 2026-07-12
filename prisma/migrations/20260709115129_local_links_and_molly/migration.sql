-- AlterTable
ALTER TABLE "Local" ADD COLUMN     "deliveryUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "reservationUrl" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "mollyCtaLabel" TEXT NOT NULL DEFAULT 'Descubre qué hacer',
ADD COLUMN     "mollyCtaUrl" TEXT NOT NULL DEFAULT '/locales',
ADD COLUMN     "mollyEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mollyImageUrl" TEXT NOT NULL DEFAULT '/brand/molly-placeholder.png',
ADD COLUMN     "mollyMessage" TEXT NOT NULL DEFAULT '¡Hola! Soy Molly. ¿Ya sabes qué plan vas a hacer hoy en Palmas Mall?',
ADD COLUMN     "mollyShowDesktop" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mollyShowMobile" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "seoDefaultTitle" SET DEFAULT 'Palmas Mall · Lifestyle Mall en Cali | Tus mejores momentos';
