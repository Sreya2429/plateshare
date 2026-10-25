USE plateshare;

ALTER TABLE users
  ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user',
  ADD CONSTRAINT chk_user_role CHECK (role IN ('user', 'admin'));

UPDATE users SET role = 'user';