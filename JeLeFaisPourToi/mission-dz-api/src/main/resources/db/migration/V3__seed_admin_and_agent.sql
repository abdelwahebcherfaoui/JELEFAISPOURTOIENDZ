-- Comptes de test pour le développement local et les collections Postman. Aucun agent/admin ne
-- peut s'inscrire via l'API (seuls les clients le peuvent, cf. auth.service.AuthService) — ces
-- deux rôles n'existent donc que par seed ou création manuelle en base.
-- Mots de passe en clair (usage dev uniquement) : Admin1234! / Agent1234!
INSERT INTO users (id, email, password_hash, name, role, country, created_at, updated_at) VALUES
    (gen_random_uuid(), 'admin@missiondz.test', '$2a$10$KArsvF6JhohWVYHpMvvpKeNmBVTqEmsEAaMtpHyMSZKJ6c/tQAXRK',
        'Admin Mission DZ', 'ADMIN', 'Algérie', now(), now()),
    (gen_random_uuid(), 'agent@missiondz.test', '$2a$10$CCF1Eft570w17lld9vA9Xuq7C6sQ5qY.C4ka9DHtUxJ3tUnselKk6',
        'Agent Terrain', 'AGENT', 'Algérie', now(), now());
