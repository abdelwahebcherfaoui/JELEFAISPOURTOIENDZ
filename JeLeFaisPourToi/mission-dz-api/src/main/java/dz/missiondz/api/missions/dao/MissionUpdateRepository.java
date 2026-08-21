package dz.missiondz.api.missions.dao;

import dz.missiondz.api.missions.entity.MissionUpdate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionUpdateRepository extends JpaRepository<MissionUpdate, UUID> {

    List<MissionUpdate> findByMissionIdOrderByCreatedAtAsc(UUID missionId);
}
