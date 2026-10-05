-- Comptes de test pour le développement local et les collections Postman. Aucun agent/admin ne
-- peut s'inscrire via l'API (seuls les clients le peuvent, cf. auth.service.AuthService) — ces
-- deux rôles n'existent donc que par seed ou création manuelle en base.
-- Mots de passe en clair (usage dev uniquement) : Admin1234! / Agent1234!
INSERT INTO users (id, email, password_hash, name, role, country, created_at, updated_at) VALUES
    (gen_random_uuid(), 'abdelwaheb.cherfaoui@missiondz.test', '$2a$10$KArsvF6JhohWVYHpMvvpKeNmBVTqEmsEAaMtpHyMSZKJ6c/tQAXRK',
        'Client Mission DZ', 'PART', 'ALGER', now(), now());
