package dz.missiondz.api.auth.dao;

import dz.missiondz.api.auth.entity.RefreshToken;
import dz.missiondz.api.users.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);
}
