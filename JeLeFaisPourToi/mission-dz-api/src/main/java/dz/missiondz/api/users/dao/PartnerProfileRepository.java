package dz.missiondz.api.users.dao;

import dz.missiondz.api.users.entity.PartnerProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerProfileRepository extends JpaRepository<PartnerProfile, UUID> {

    Optional<PartnerProfile> findByUserId(UUID userId);
}
