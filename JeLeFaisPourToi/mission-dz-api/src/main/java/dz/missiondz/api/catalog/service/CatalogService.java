package dz.missiondz.api.catalog.service;

import dz.missiondz.api.catalog.dao.ServiceCategoryRepository;
import dz.missiondz.api.catalog.dto.CategoryResponse;
import dz.missiondz.api.catalog.entity.ServiceCategory;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CatalogService {

    private final ServiceCategoryRepository serviceCategoryRepository;

    public CatalogService(ServiceCategoryRepository serviceCategoryRepository) {
        this.serviceCategoryRepository = serviceCategoryRepository;
    }

    public List<CategoryResponse> listActiveCategories() {
        return serviceCategoryRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    private CategoryResponse toResponse(ServiceCategory category) {
        return new CategoryResponse(
                category.getId(),
                category.getSlug(),
                category.getName(),
                category.getDescription(),
                category.getIcon());
    }
}
