-- ======================================
-- EXTENSIONS
-- ======================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================
-- USER FRAGMENTED TABLES
-- ======================================

CREATE TABLE UserEmails (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL
);

CREATE TABLE UserPasswords (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    password_hash TEXT NOT NULL
);

CREATE TABLE UserNames (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT
);

CREATE TABLE UserCreationTimes (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- ======================================
-- INCIDENT FRAGMENTED TABLES
-- ======================================

CREATE TABLE IncidentTypes (
    incident_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL
);

CREATE TABLE IncidentDescriptions (
    incident_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT
);

-- Prisma does NOT support PostGIS → split into numbers
CREATE TABLE IncidentLocations (
    incident_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE IncidentSeverity (
    incident_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    severity SMALLINT DEFAULT 1
);

CREATE TABLE IncidentApprovalStatus (
    incident_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    approved BOOLEAN DEFAULT FALSE
);

-- ======================================
-- MAPPING TABLE (NO FOREIGN KEYS)
-- ======================================

CREATE TABLE UserIncidentMap (
    map_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    incident_id uuid
);
