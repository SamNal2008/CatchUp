-- Add birthday column to contacts table with ISO string format constraint
ALTER TABLE contacts ADD COLUMN birthday TEXT NULL CHECK (
    birthday IS NULL OR 
    (
        birthday LIKE '____-__-__T__:__:__.___%' AND -- ISO 8601 format check
        birthday = datetime(birthday) -- Valid date check
    )
);

-- Add index for faster birthday lookups
CREATE INDEX idx_contacts_birthday ON contacts(birthday);
