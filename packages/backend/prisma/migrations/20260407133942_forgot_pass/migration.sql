-- AlterTable
ALTER TABLE "User" ADD COLUMN "forgotPassExpiry" DATETIME;
ALTER TABLE "User" ADD COLUMN "forgotPassToken" TEXT;
