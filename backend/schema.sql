CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE card_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(120) NOT NULL
);

CREATE INDEX card_brands_description_idx ON card_brands (description);