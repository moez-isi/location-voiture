-- ============================================================
-- LOCATION DE VOITURE - SCRIPT SQL COMPLET
-- ============================================================
-- 1. Créer la base de données (à exécuter dans psql ou pgAdmin)
-- CREATE DATABASE location_voiture;
-- \c location_voiture;

-- ============================================================
-- TABLE : AGENTS (utilisateurs qui gèrent l'application)
-- ============================================================
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telephone VARCHAR(20),
    cin VARCHAR(50) UNIQUE,
    adresse TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : VEHICULES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicules (
    id SERIAL PRIMARY KEY,
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    immatriculation VARCHAR(50) UNIQUE NOT NULL,
    annee INTEGER,
    prix_jour DECIMAL(10,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'disponible' CHECK (statut IN ('disponible', 'loue', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE : LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    vehicule_id INTEGER NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES agents(id),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    montant_total DECIMAL(10,2),
    statut VARCHAR(20) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'annule')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (date_fin >= date_debut)
);

-- ============================================================
-- TABLE : RETOURS
-- ============================================================
CREATE TABLE IF NOT EXISTS retours (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    date_retour DATE NOT NULL DEFAULT CURRENT_DATE,
    etat VARCHAR(50) DEFAULT 'bon' CHECK (etat IN ('bon', 'abime', 'mauvais')),
    kilometrage_retour INTEGER,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEX pour optimiser les recherches
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);
CREATE INDEX IF NOT EXISTS idx_vehicules_statut ON vehicules(statut);
CREATE INDEX IF NOT EXISTS idx_locations_statut ON locations(statut);
CREATE INDEX IF NOT EXISTS idx_locations_dates ON locations(date_debut, date_fin);

-- ============================================================
-- DONNÉES DE TEST (optionnel - à exécuter après création)
-- ============================================================

-- Agent par défaut (mot de passe : admin123)
-- Le hash est généré avec bcrypt (10 rounds)
INSERT INTO agents (email, password, nom, prenom) VALUES
('admin@location.com', '$2b$10$kEs1LoKCGNCWSpJnGTucXe6zqhv97ZQGMlDYcZ4fWKZgngQg/FXNi', 'Admin', 'System')
ON CONFLICT (email) DO NOTHING;

-- Clients de test
INSERT INTO clients (nom, prenom, email, telephone, cin, adresse) VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '0612345678', 'AB123456', '12 Rue de Paris, 75001 Paris'),
('Martin', 'Sophie', 'sophie.martin@email.com', '0698765432', 'CD789012', '45 Avenue Lyon, 69001 Lyon'),
('Bernard', 'Pierre', 'pierre.bernard@email.com', '065551234', 'EF345678', '8 Boulevard Marseille, 13001 Marseille')
ON CONFLICT (email) DO NOTHING;

-- Véhicules de test
INSERT INTO vehicules (marque, modele, immatriculation, annee, prix_jour, statut) VALUES
('Renault', 'Clio 5', 'AB-123-CD', 2022, 45.00, 'disponible'),
('Peugeot', '208', 'EF-456-GH', 2023, 50.00, 'disponible'),
('Citroën', 'C3', 'IJ-789-KL', 2021, 40.00, 'disponible'),
('Volkswagen', 'Golf 8', 'MN-012-OP', 2023, 65.00, 'disponible'),
('Toyota', 'Yaris', 'QR-345-ST', 2022, 48.00, 'disponible'),
('BMW', 'Série 1', 'UV-678-WX', 2023, 85.00, 'disponible')
ON CONFLICT (immatriculation) DO NOTHING;

-- Vue pour les locations avec infos client et véhicule
CREATE OR REPLACE VIEW v_locations_details AS
SELECT 
    l.id,
    l.client_id,
    l.vehicule_id,
    l.agent_id,
    l.date_debut,
    l.date_fin,
    l.montant_total,
    l.statut,
    l.created_at,
    c.nom as client_nom,
    c.prenom as client_prenom,
    c.telephone as client_telephone,
    v.marque as vehicule_marque,
    v.modele as vehicule_modele,
    v.immatriculation,
    v.prix_jour,
    a.nom as agent_nom
FROM locations l
JOIN clients c ON l.client_id = c.id
JOIN vehicules v ON l.vehicule_id = v.id
LEFT JOIN agents a ON l.agent_id = a.id;

-- Vue pour le tableau de bord
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM clients) as total_clients,
    (SELECT COUNT(*) FROM vehicules) as total_vehicules,
    (SELECT COUNT(*) FROM vehicules WHERE statut = 'disponible') as vehicules_disponibles,
    (SELECT COUNT(*) FROM vehicules WHERE statut = 'loue') as vehicules_loues,
    (SELECT COUNT(*) FROM locations WHERE statut = 'en_cours') as locations_en_cours,
    (SELECT COUNT(*) FROM locations WHERE statut = 'termine') as locations_terminees,
    (SELECT COALESCE(SUM(montant_total), 0) FROM locations WHERE statut = 'termine') as revenus_total;

-- Fonction pour calculer le montant automatiquement
CREATE OR REPLACE FUNCTION calculer_montant_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.montant_total := (
        SELECT v.prix_jour * (NEW.date_fin - NEW.date_debut + 1)
        FROM vehicules v WHERE v.id = NEW.vehicule_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer le montant avant insertion
DROP TRIGGER IF EXISTS trg_calcul_montant ON locations;
CREATE TRIGGER trg_calcul_montant
    BEFORE INSERT ON locations
    FOR EACH ROW
    EXECUTE FUNCTION calculer_montant_location();

-- Fonction pour mettre à jour le statut du véhicule quand location créée
CREATE OR REPLACE FUNCTION update_vehicule_status_on_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.statut = 'en_cours' THEN
        UPDATE vehicules SET statut = 'loue' WHERE id = NEW.vehicule_id;
    ELSIF NEW.statut = 'termine' OR NEW.statut = 'annule' THEN
        UPDATE vehicules SET statut = 'disponible' WHERE id = NEW.vehicule_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_location_vehicule ON locations;
CREATE TRIGGER trg_location_vehicule
    AFTER INSERT OR UPDATE OF statut ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicule_status_on_location();

-- Message de confirmation
SELECT 'Base de données location_voiture créée avec succès !' as status;
