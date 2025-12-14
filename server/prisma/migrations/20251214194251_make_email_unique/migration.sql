/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `UserEmails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `UserNames` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "IncidentApprovalStatus" ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "UserEmails_email_key" ON "UserEmails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserNames_name_key" ON "UserNames"("name");
