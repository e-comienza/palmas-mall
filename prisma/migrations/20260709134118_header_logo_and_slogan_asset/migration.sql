-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "sloganImageUrl" TEXT NOT NULL DEFAULT '/brand/slogan.webp',
ALTER COLUMN "logoUrl" SET DEFAULT '/brand/logo-header.png';
