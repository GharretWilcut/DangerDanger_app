-- CreateTable
CREATE TABLE "UserEmails" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserPasswords" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "password_hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserNames" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "UserCreationTimes" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IncidentTypes" (
    "incident_id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "IncidentDescriptions" (
    "incident_id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "IncidentLocations" (
    "incident_id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL,
    "longitude" REAL
);

-- CreateTable
CREATE TABLE "IncidentSeverity" (
    "incident_id" TEXT NOT NULL PRIMARY KEY,
    "severity" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "IncidentApprovalStatus" (
    "incident_id" TEXT NOT NULL PRIMARY KEY,
    "approved" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "UserIncidentMap" (
    "user_id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "NotificationUsers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationTitles" (
    "notification_id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationMessages" (
    "notification_id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationTimes" (
    "notification_id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEmails_email_key" ON "UserEmails"("email");
