/*
  Warnings:

  - The primary key for the `UserIncidentMap` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `map_id` on the `UserIncidentMap` table. All the data in the column will be lost.
  - The required column `id` was added to the `UserIncidentMap` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "IncidentSeverity" ALTER COLUMN "severity" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserIncidentMap" DROP CONSTRAINT "UserIncidentMap_pkey",
DROP COLUMN "map_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "UserIncidentMap_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "NotificationUsers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,

    CONSTRAINT "NotificationUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTitles" (
    "notification_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "NotificationTitles_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "NotificationMessages" (
    "notification_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "NotificationMessages_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "NotificationTimes" (
    "notification_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationTimes_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);
