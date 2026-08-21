package dz.missiondz.api.payments.dao;

import dz.missiondz.api.payments.entity.Quote;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRepository extends JpaRepository<Quote, UUID> {

    List<Quote> findByMissionId(UUID missionId);
}
