CREATE TABLE users (
    id                 UUID PRIMARY KEY,
    email              VARCHAR(255) NOT NULL UNIQUE,
    password_hash      VARCHAR(255) NOT NULL,
    name               VARCHAR(255) NOT NULL,
    phone              VARCHAR(50),
    role               VARCHAR(20) NOT NULL,
    country            VARCHAR(100),
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE partner_profiles (
    id                 UUID PRIMARY KEY,
    user_id            UUID NOT NULL UNIQUE REFERENCES users (id),
    entreprise         VARCHAR(255),
    specialite         VARCHAR(255),
    wilaya             VARCHAR(100) NOT NULL,
    statut_validation  VARCHAR(20) NOT NULL,
    taux_commission    NUMERIC(5, 2),
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE service_categories (
    id                 UUID PRIMARY KEY,
    slug               VARCHAR(100) NOT NULL UNIQUE,
    name               VARCHAR(255) NOT NULL,
    description        TEXT,
    icon               VARCHAR(20),
    phase              VARCHAR(20) NOT NULL,
    active             BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE missions (
    id                 UUID PRIMARY KEY,
    client_id          UUID NOT NULL REFERENCES users (id),
    category_id        UUID NOT NULL REFERENCES service_categories (id),
    title              VARCHAR(255) NOT NULL,
    description        TEXT NOT NULL,
    address_algeria    VARCHAR(500) NOT NULL,
    wilaya             VARCHAR(100) NOT NULL,
    preferred_date     DATE,
    status             VARCHAR(20) NOT NULL,
    executor_type      VARCHAR(20),
    executor_id        UUID,
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE mission_updates (
    id                 UUID PRIMARY KEY,
    mission_id         UUID NOT NULL REFERENCES missions (id) ON DELETE CASCADE,
    author_id          UUID NOT NULL REFERENCES users (id),
    message            TEXT NOT NULL,
    visible_to_client  BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE attachments (
    id                    UUID PRIMARY KEY,
    mission_id            UUID NOT NULL REFERENCES missions (id) ON DELETE CASCADE,
    mission_update_id     UUID REFERENCES mission_updates (id),
    cloudinary_url        VARCHAR(1000) NOT NULL,
    cloudinary_public_id  VARCHAR(500) NOT NULL,
    type                  VARCHAR(10) NOT NULL,
    uploaded_by_id        UUID NOT NULL REFERENCES users (id),
    created_at            TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE quotes (
    id                 UUID PRIMARY KEY,
    mission_id         UUID NOT NULL REFERENCES missions (id) ON DELETE CASCADE,
    montant            NUMERIC(10, 2) NOT NULL,
    devise             VARCHAR(3) NOT NULL DEFAULT 'EUR',
    description        TEXT,
    statut             VARCHAR(20) NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id                 UUID PRIMARY KEY,
    mission_id         UUID NOT NULL REFERENCES missions (id) ON DELETE CASCADE,
    type               VARCHAR(10) NOT NULL,
    montant            NUMERIC(10, 2) NOT NULL,
    statut             VARCHAR(20) NOT NULL,
    methode            VARCHAR(10) NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE partner_commissions (
    id                 UUID PRIMARY KEY,
    mission_id         UUID NOT NULL REFERENCES missions (id) ON DELETE CASCADE,
    partner_id         UUID NOT NULL REFERENCES partner_profiles (id),
    montant            NUMERIC(10, 2) NOT NULL,
    statut             VARCHAR(20) NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_missions_client_id ON missions (client_id);
CREATE INDEX idx_missions_executor_id ON missions (executor_id);
CREATE INDEX idx_mission_updates_mission_id ON mission_updates (mission_id);
CREATE INDEX idx_attachments_mission_id ON attachments (mission_id);
CREATE INDEX idx_quotes_mission_id ON quotes (mission_id);
CREATE INDEX idx_payments_mission_id ON payments (mission_id);
CREATE INDEX idx_partner_commissions_mission_id ON partner_commissions (mission_id);
CREATE INDEX idx_partner_commissions_partner_id ON partner_commissions (partner_id);
