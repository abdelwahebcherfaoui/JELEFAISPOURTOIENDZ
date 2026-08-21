package dz.missiondz.api.missions.dao;

import dz.missiondz.api.missions.entity.Mission;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionRepository extends JpaRepository<Mission, UUID> {

    List<Mission> findByClientId(UUID clientId);

    List<Mission> findByExecutorId(UUID executorId);
}
