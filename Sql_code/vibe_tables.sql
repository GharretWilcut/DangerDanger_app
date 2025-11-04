-- enable extensions (run as superuser)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- users table
CREATE TABLE Users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- incidents / reports table
CREATE TABLE Incidents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES Users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,            -- "crash", "crime", "near-miss", etc
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  location GEOGRAPHY(POINT, 4326), -- PostGIS geography point (lon/lat)
  severity SMALLINT DEFAULT 1,
  approved BOOLEAN DEFAULT FALSE  -- moderation flag
);

-- index for fast geo queries
CREATE INDEX idx_incidents_geog ON incidents USING GIST (location);



--sample insert 
INSERT INTO Incidents (user_id, type, description, location)
VALUES ('d8fa3b16-c010-4d73-8de8-1db21f682a06', 'crash', 'Two-car collision', ST_GeographyFromText('SRID=4326;POINT(-87.6298 41.8781)'));
-- replace <user-uuid> with an actual UUID from the users table

-- get incidents within 2000 meters of (lng, lat)
SELECT id, type, description, created_at,
  ST_X(ST_AsText(ST_Transform(ST_SetSRID(ST_Point(ST_X(location::geometry), ST_Y(location::geometry)),4326),4326))) as lng,
  ST_Y(ST_AsText(ST_Transform(ST_SetSRID(ST_Point(ST_X(location::geometry), ST_Y(location::geometry)),4326),4326))) as lat
FROM incidents
WHERE ST_DWithin(location, ST_MakePoint(-87.6298, 41.8781)::geography, 2000);
