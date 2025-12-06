CREATE DATABASE dusol_events;
USE dusol_events;

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
    image_data LONGTEXT,
    map_link VARCHAR(500),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT,
    user_id INT,
    student_name VARCHAR(100),
    roll_number VARCHAR(50),
    phone VARCHAR(15),
    email VARCHAR(100),
    student_year VARCHAR(20),
    id_card_image LONGTEXT,
    confirmation_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
