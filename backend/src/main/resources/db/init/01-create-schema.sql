CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    x FLOAT NOT NULL,
    y INTEGER NOT NULL,
    z DOUBLE PRECISION NOT NULL,
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (name <> ''),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    type VARCHAR
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (name <> ''),
    date TIMESTAMP,
    min_age INTEGER CHECK (min_age >= 0),
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS persons (
    id SERIAL PRIMARY KEY,
    eye_color VARCHAR NOT NULL,
    hair_color VARCHAR NOT NULL,
    location_id INTEGER REFERENCES locations(id),
    passport_id VARCHAR(29) UNIQUE CHECK (passport_id <> ''),
    nationality VARCHAR
);

CREATE TABLE IF NOT EXISTS coordinates (
    id SERIAL PRIMARY KEY,
    x INTEGER NOT NULL CHECK (x > -201),
    y DOUBLE PRECISION NOT NULL CHECK (y > -5)
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (name <> ''),
    coordinates_id INTEGER NOT NULL REFERENCES coordinates(id),
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    person_id INTEGER REFERENCES persons(id),
    event_id INTEGER REFERENCES events(id),
    price BIGINT NOT NULL CHECK (price > 0),
    type VARCHAR,
    discount FLOAT CHECK (discount > 0 AND discount <= 100),
    number DOUBLE PRECISION NOT NULL CHECK (number > 0),
    refundable BOOLEAN NOT NULL,
    venue_id INTEGER NOT NULL REFERENCES venues(id)
);

CREATE TABLE IF NOT EXISTS import_history (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL CHECK (filename <> ''),
    imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    entity_type VARCHAR(255) NOT NULL,
    processed_records INTEGER,
    total_records INTEGER,
    error_count INTEGER,
    import_status VARCHAR(255) NOT NULL,
    result_description VARCHAR(1024) NOT NULL DEFAULT '-' CHECK (result_description <> '')
);

CREATE TABLE IF NOT EXISTS import_batches (
    id SERIAL PRIMARY KEY,
    import_id INTEGER NOT NULL REFERENCES import_history(id),
    batch_number INTEGER NOT NULL CHECK (batch_number >= 0),
    batch_size INTEGER NOT NULL CHECK (batch_size >= 0),
    batch_status VARCHAR(255) NOT NULL,
    records TEXT,
    total_records INTEGER NOT NULL CHECK (total_records >= 0),
    processed_records INTEGER NOT NULL CHECK (processed_records >= 0)
);

CREATE INDEX ticket_name ON tickets USING HASH (name);

CREATE TABLE IF NOT EXISTS file_outbox (
    id SERIAL PRIMARY KEY,
    import_history_id BIGINT NOT NULL REFERENCES import_history(id),
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('UPLOAD', 'DELETE')),
    file_name VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    processed_at TIMESTAMP NULL
);

CREATE INDEX idx_outbox_import_id ON file_outbox(import_history_id);
CREATE INDEX idx_outbox_unprocessed ON file_outbox(created_at) WHERE processed_at IS NULL;

CREATE PUBLICATION dbz_publication FOR TABLE file_outbox;
