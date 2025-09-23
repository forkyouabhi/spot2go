-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer','owner')),
    provider TEXT DEFAULT 'local',
    provider_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Places owned by business owners
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,  -- e.g., cafe, library, coworking
    amenities TEXT[], -- wifi, power, etc.
    location JSONB,   -- { lat, lng, address }
    created_at TIMESTAMP DEFAULT NOW()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    place_id INT REFERENCES places(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    available BOOLEAN DEFAULT true
);

-- Bundles of items
CREATE TABLE IF NOT EXISTS bundles (
    id SERIAL PRIMARY KEY,
    place_id INT REFERENCES places(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS bundle_items (
    bundle_id INT REFERENCES bundles(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    PRIMARY KEY (bundle_id, menu_item_id)
);

-- Bookings with payment linkage
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    place_id INT REFERENCES places(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, paid, cancelled
    amount NUMERIC,
    payment_id TEXT, -- Stripe PaymentIntent ID
    created_at TIMESTAMP DEFAULT NOW()
);

-- Device tokens for push notifications
CREATE TABLE IF NOT EXISTS user_devices (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    fcm_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_places_location ON places USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_place ON bookings(place_id);
