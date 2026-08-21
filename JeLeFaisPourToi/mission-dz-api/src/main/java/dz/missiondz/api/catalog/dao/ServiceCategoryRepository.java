package dz.missiondz.api.catalog.dao;

import dz.missiondz.api.catalog.entity.ServiceCategory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID> {

    List<ServiceCategory> findByActiveTrue();

    Optional<ServiceCategory> findBySlug(String slug);
}
