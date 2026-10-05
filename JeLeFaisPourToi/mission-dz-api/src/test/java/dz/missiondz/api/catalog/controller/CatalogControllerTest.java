package dz.missiondz.api.catalog.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dz.missiondz.api.IntegrationTest;
import dz.missiondz.api.catalog.dao.ServiceCategoryRepository;
import dz.missiondz.api.catalog.entity.CategoryPhase;
import dz.missiondz.api.catalog.entity.ServiceCategory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
@AutoConfigureMockMvc
class CatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ServiceCategoryRepository serviceCategoryRepository;

    @Test
    void listsOnlyActiveCategoriesAndIsPublic() throws Exception {
        String activeName = "Catégorie active " + System.nanoTime();
        String inactiveName = "Catégorie inactive " + System.nanoTime();

        serviceCategoryRepository.save(ServiceCategory.builder()
                .slug("active-" + System.nanoTime())
                .name(activeName)
                .description("Une catégorie ouverte aux clients.")
                .icon("🔍")
                .phase(CategoryPhase.MVP)
                .active(true)
                .build());
        serviceCategoryRepository.save(ServiceCategory.builder()
                .slug("inactive-" + System.nanoTime())
                .name(inactiveName)
                .description("Une catégorie pas encore ouverte.")
                .icon("🏠")
                .phase(CategoryPhase.PHASE_1)
                .active(false)
                .build());

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == '" + activeName + "')]").exists())
                .andExpect(jsonPath("$[?(@.name == '" + inactiveName + "')]").doesNotExist());
    }
}
