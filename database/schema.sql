
CREATE DATABASE IF NOT EXISTS plateshare
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plateshare;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS food_listings;
DROP TABLE IF EXISTS food_categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  phone      VARCHAR(20)  NOT NULL,
  user_type  VARCHAR(20)  NOT NULL,
  password   VARCHAR(255) NOT NULL,  
  CONSTRAINT chk_user_type CHECK (user_type IN ('Individual', 'Organization'))
) ENGINE=InnoDB;


CREATE TABLE food_categories (
  category_id    INT AUTO_INCREMENT PRIMARY KEY,
  category_name  VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE food_listings (
  listing_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  category_id    INT NOT NULL,
  food_name      VARCHAR(120) NOT NULL,
  quantity       INT NOT NULL,
  quantity_unit  VARCHAR(30) NOT NULL,
  prepared_time  DATETIME NOT NULL,
  expiry_time    DATETIME NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'Available',
  CONSTRAINT fk_listing_user     FOREIGN KEY (user_id)     REFERENCES users(user_id)                ON DELETE CASCADE,
  CONSTRAINT fk_listing_category FOREIGN KEY (category_id) REFERENCES food_categories(category_id),
  CONSTRAINT chk_listing_status  CHECK (status IN ('Available', 'Booked')),
  CONSTRAINT chk_listing_qty     CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE bookings (
  booking_id    INT AUTO_INCREMENT PRIMARY KEY,
  listing_id    INT NOT NULL,
  user_id       INT NOT NULL,
  booking_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        VARCHAR(20) NOT NULL DEFAULT 'Booked',
  CONSTRAINT fk_booking_listing FOREIGN KEY (listing_id) REFERENCES food_listings(listing_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)             ON DELETE CASCADE,
  CONSTRAINT chk_booking_status CHECK (status IN ('Booked', 'Cancelled'))
) ENGINE=InnoDB;

CREATE INDEX idx_listing_status  ON food_listings (status, expiry_time);
CREATE INDEX idx_booking_listing ON bookings (listing_id, status);

-- Sample categories
INSERT INTO food_categories (category_name) VALUES
  ('Cooked Food'),
  ('Bakery'),
  ('Fruits'),
  ('Vegetables'),
  ('Packaged Food');
