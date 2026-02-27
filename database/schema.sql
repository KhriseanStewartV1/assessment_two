-- Community Service Booking Application - Database Schema
-- Run this file in MySQL to create the database and tables.

CREATE DATABASE IF NOT EXISTS community_booking;
USE community_booking;

-- Users table (predefined users, no auth required)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Booking status lookup table (Scheduled, Completed, Cancelled)
CREATE TABLE booking_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services offered by the organization
CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  estimated_duration_minutes INT NOT NULL,
  is_available TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings (references user, service, and booking_status)
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  service_id INT NOT NULL,
  status_id INT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  FOREIGN KEY (status_id) REFERENCES booking_status(id) ON DELETE RESTRICT
);

-- Seed: predefined user (ID = 1) for bookings
INSERT INTO users (id, name, email) VALUES (1, 'Default Resident', 'resident@example.com');

-- Seed: booking statuses
INSERT INTO booking_status (id, name) VALUES (1, 'Scheduled'), (2, 'Completed'), (3, 'Cancelled');

-- Optional: sample services for testing
INSERT INTO services (name, description, price, estimated_duration_minutes, is_available) VALUES
('Plumbing Repairs', 'General plumbing repairs and maintenance', 75.00, 60, 1),
('Electrical Inspection', 'Safety inspection and minor fixes', 50.00, 45, 1);
