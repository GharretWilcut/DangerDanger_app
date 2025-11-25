-- CreateTable
CREATE TABLE "UserEmails" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "UserEmails_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "UserPasswords" (
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "UserPasswords_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "UserNames" (
    "user_id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "UserNames_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "UserCreationTimes" (
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCreationTimes_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "IncidentTypes" (
    "incident_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "IncidentTypes_pkey" PRIMARY KEY ("incident_id")
);

-- CreateTable
CREATE TABLE "IncidentDescriptions" (
    "incident_id" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "IncidentDescriptions_pkey" PRIMARY KEY ("incident_id")
);

-- CreateTable
CREATE TABLE "IncidentLocations" (
    "incident_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "IncidentLocations_pkey" PRIMARY KEY ("incident_id")
);

-- CreateTable
CREATE TABLE "IncidentSeverity" (
    "incident_id" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "IncidentSeverity_pkey" PRIMARY KEY ("incident_id")
);

-- CreateTable
CREATE TABLE "IncidentApprovalStatus" (
    "incident_id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IncidentApprovalStatus_pkey" PRIMARY KEY ("incident_id")
);

-- CreateTable
CREATE TABLE "UserIncidentMap" (
    "map_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,

    CONSTRAINT "UserIncidentMap_pkey" PRIMARY KEY ("map_id")
);
