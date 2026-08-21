package dz.missiondz.api.payments.dao;

import dz.missiondz.api.payments.entity.PartnerCommission;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerCommissionRepository extends JpaRepository<PartnerCommission, UUID> {

    List<PartnerCommission> findByPartnerId(UUID partnerId);

    List<PartnerCommission> findByMissionId(UUID missionId);
}
