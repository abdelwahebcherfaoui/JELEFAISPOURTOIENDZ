package dz.missiondz.api.catalog.controller;

import dz.missiondz.api.catalog.dto.CategoryResponse;
import dz.missiondz.api.catalog.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<CategoryResponse> listActiveCategories() {
        return catalogService.listActiveCategories();
    }
}
