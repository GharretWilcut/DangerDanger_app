CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE Reports (
    ReportID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    ReportName VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    reportType ENUM('Accident', 'Theft', 'Vandalism', 'Other') NOT NULL,
    reportComment VARCHAR(200) NOT NULL,
    location_longitude DECIMAL(9,6) NOT NULL,
    location_latitude DECIMAL(9,6) NOT NULL
);


--drop table reports;

--Radius Query Example
-- get incidents within 2000 meters of (lng, lat)
SELECT id, type, description, created_at,
  ST_X(ST_AsText(ST_Transform(ST_SetSRID(ST_Point(ST_X(location::geometry), ST_Y(location::geometry)),4326),4326))) as lng,
  ST_Y(ST_AsText(ST_Transform(ST_SetSRID(ST_Point(ST_X(location::geometry), ST_Y(location::geometry)),4326),4326))) as lat
FROM Reports
WHERE ST_DWithin(location, ST_MakePoint(-87.6298, 41.8781)::geography, 2000);
