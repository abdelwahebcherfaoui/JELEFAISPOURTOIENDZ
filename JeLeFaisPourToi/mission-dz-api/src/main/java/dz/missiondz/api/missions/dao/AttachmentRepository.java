package dz.missiondz.api.missions.dao;

import dz.missiondz.api.missions.entity.Attachment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    List<Attachment> findByMissionId(UUID missionId);
}
