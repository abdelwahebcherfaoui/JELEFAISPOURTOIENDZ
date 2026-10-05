package dz.missiondz.api.missions.dao;

import dz.missiondz.api.missions.entity.Mission;
import dz.missiondz.api.missions.entity.MissionStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionRepository extends JpaRepository<Mission, UUID> {

    List<Mission> findByClientId(UUID clientId);

    List<Mission> findByExecutorId(UUID executorId);

    /** Missions restées dans {@code status} depuis plus de {@code threshold} — validation tacite à 72h. */
    List<Mission> findByStatusAndUpdatedAtBefore(MissionStatus status, Instant threshold);
}
