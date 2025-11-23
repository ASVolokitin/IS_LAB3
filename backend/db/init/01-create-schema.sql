CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    x FLOAT NOT NULL,
    y INTEGER NOT NULL,
    z DOUBLE PRECISION NOT NULL,
    name VARCHAR(255)
);

CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (name <> ''),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    type VARCHAR
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (name <> ''),
    date TIMESTAMP,
    min_age INTEGER CHECK (min_age >= 0),
    description TEXT NOT NULL
);

CREATE TABLE persons (
    id SERIAL PRIMARY KEY,
    eye_color VARCHAR NOT NULL,
    hair_color VARCHAR NOT NULL,
    location_id INTEGER REFERENCES locations(id),
    passport_id VARCHAR(29) UNIQUE CHECK (passport_id <> ''),
    nationality VARCHAR
);

CREATE TABLE coordinates (
    id SERIAL PRIMARY KEY,
    x INTEGER NOT NULL CHECK (x > -201),
    y DOUBLE PRECISION NOT NULL CHECK (y > -5)
);

CREATE TABLE tickets (
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