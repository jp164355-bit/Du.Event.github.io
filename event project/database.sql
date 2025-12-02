CREATE DATABASE du_sol_events;
USE du_sol_events;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    college_id VARCHAR(12) UNIQUE,
    role ENUM('Student', 'Organizer'),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    date DATE,
    location VARCHAR(255),
    description TEXT,
    image_url TEXT,
    map_link VARCHAR(500),
    created_by VARCHAR(12),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT,
    student_name VARCHAR(100),
    roll_number VARCHAR(20),
    phone VARCHAR(15),
    email VARCHAR(100),
    year VARCHAR(20),
    id_card_url TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
