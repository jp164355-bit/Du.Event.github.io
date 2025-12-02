-- MySQL Database for DU SOL Events
CREATE DATABASE dusol_events;
USE dusol_events;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    college_id VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    role ENUM('Student', 'Organizer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(300),
    map_link VARCHAR(500),
    registrations INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    student_name VARCHAR(100),
    roll_number VARCHAR(50),
    phone VARCHAR(15),
    email VARCHAR(100),
    year VARCHAR(20),
    id_card_url VARCHAR(300),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Sample Data
INSERT INTO users (college_id, password_hash, role) VALUES 
('SOL20251234', SHA2('password123', 256), 'Student'),
('SOL2025ORG01', SHA2('admin123', 256), 'Organizer');

INSERT INTO events (name, event_date, location, description, map_link) VALUES 
('Annual Cultural Fest', '2025-12-15', 'North Campus, DU', 'Music festival...', 'https://google.com/maps?q=North+Campus');
