/*
  Warnings:

  - A unique constraint covering the columns `[password_hash]` on the table `UserPasswords` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserPasswords_password_hash_key" ON "UserPasswords"("password_hash");
