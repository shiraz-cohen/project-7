drop database if exists `project7`;
-- Create the database
CREATE DATABASE `project7`;

-- Use the newly created database
USE `project7`;

-- Create 'unusualevents' table
CREATE TABLE unusualevents (
    eventID INT AUTO_INCREMENT PRIMARY KEY,
    eventName VARCHAR(100) NOT NULL,
    eventType VARCHAR(50) NOT NULL,
    eventDate DATE NOT NULL,
    eventVideo VARCHAR(200) NOT NULL
);

-- Inserting data into 'unusualevents' table
INSERT INTO unusualevents (eventName, eventType, eventDate, eventVideo)
VALUES
    ('Security Breach', 'Security', '2024-01-02', 'security_breach.mp4'),
    ('Fire Alarm Triggered', 'Fire', '2024-01-03', 'fire_alarm.mp4'),
    ('Suspicious Activity', 'Security', '2024-01-04', 'suspicious_activity.mp4'),
    ('Unexpected Incident', 'Miscellaneous', '2024-01-05', 'unexpected_incident.mp4');

-- Select all records from 'unusualevents' table
SELECT * FROM unusualevents;



CREATE TABLE users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    userRank VARCHAR(20) NOT NULL
);

-- Inserting data into 'users' table
INSERT INTO users (username, name, userRank)
VALUES
    ('john_doe', 'John Doe', 'admin'),
    ('jane_smith', 'Jane Smith', 'user'),
    ('mike_jones', 'Mike Jones', 'user'),
    ('sara_wilson', 'Sara Wilson', 'admin'),
    ('alex_lee', 'Alex Lee', 'user'),
    ('emily_brown', 'Emily Brown', 'user'),
    ('david_clark', 'David Clark', 'user'),
    ('olivia_green', 'Olivia Green', 'user'),
    ('william_white', 'William White', 'user'),
    ('ava_martin', 'Ava Martin', 'user');

CREATE TABLE passwords (
    userID INT PRIMARY KEY,
    password VARCHAR(100) NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(ID)
);

-- Inserting data into 'passwords' table
INSERT INTO passwords (userID, password)
VALUES
    (1, 'P@ssw0rd'),
    (2, 'U$er1234'),
    (3, 'M!ke5678'),
    (4, 'AdminP@ss'),
    (5, 'A1exL33'),
    (6, 'Em1lyBr0'),
    (7, 'D@v1dC!ark'),
    (8, 'Ol1v1@Gr'),
    (9, 'W1llWh1t'),
    (10, 'AvaM@rt1n');

CREATE TABLE cameras (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(200) NOT NULL,
    junction VARCHAR(100),
    video VARCHAR(200) NOT NULL
);

-- Inserting data into 'cameras' table
INSERT INTO cameras (location, junction, video)
VALUES
    ('Main Street', 'Junction A', 'main_street.mp4'),
    ('Park Entrance', 'Junction B', 'park_entrance.mp4'),
    ('Shopping Mall', 'Junction C', 'mall_camera.mp4'),
    ('City Square', 'Junction D', 'city_square_cam.mp4'),
    ('Highway Exit', 'Junction E', 'highway_exit_feed.mp4'),
    ('Beachfront', 'Junction F', 'beach_cam.mp4'),
    ('Subway Station', 'Junction G', 'subway_feed.mp4'),
    ('Hospital Entrance', 'Junction H', 'hospital_entrance.mp4'),
    ('School Gate', 'Junction I', 'school_camera.mp4'),
    ('Office Building', 'Junction J', 'office_cam.mp4'),
    ('Airport Terminal', 'Junction K', 'airport_terminal.mp4'),
    ('Train Station', 'Junction L', 'train_station_feed.mp4'),
    ('Amusement Park', 'Junction M', 'amusement_park.mp4'),
    ('Sports Stadium', 'Junction N', 'stadium_camera.mp4'),
    ('Library Entrance', 'Junction O', 'library_feed.mp4'),
    ('Zoo Entrance', 'Junction P', 'zoo_camera.mp4'),
    ('Art Gallery', 'Junction Q', 'gallery_cam.mp4'),
    ('Restaurant Patio', 'Junction R', 'restaurant_patio.mp4'),
    ('Historic Site', 'Junction S', 'historic_site_cam.mp4'),
    ('Gym Entrance', 'Junction T', 'gym_camera.mp4');

CREATE TABLE cameraAccess (
    userID INT,
    cameraID INT,
    FOREIGN KEY (userID) REFERENCES users(ID),
    FOREIGN KEY (cameraID) REFERENCES cameras(ID),
    PRIMARY KEY (userID, cameraID)
);

-- Inserting data into 'cameraAccess' table
INSERT INTO cameraAccess (userID, cameraID)
VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 2), (2, 3), (2, 4),
    (3, 4), (3, 5), (3, 6),
    (4, 1), (4, 7), (4, 8),
    (5, 9), (5, 10),
    (6, 11), (6, 12),
    (7, 13), (7, 14),
    (8, 15),
    (9, 16),
    (10, 17), (10, 18),
    (1, 19),
    (2, 20),
    (3, 1),
    (4, 2),
    (5, 3),
    (6, 4),
    (7, 5),
    (8, 6),
    (9, 7),
    (10, 8);

-- Select all users
SELECT * FROM users;

-- Select all passwords
SELECT * FROM passwords;

-- Select all cameras
SELECT * FROM cameras;

-- Select all camera access rights
SELECT * FROM cameraAccess;


