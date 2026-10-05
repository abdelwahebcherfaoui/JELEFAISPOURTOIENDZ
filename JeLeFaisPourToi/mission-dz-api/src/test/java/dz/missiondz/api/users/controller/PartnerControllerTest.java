package dz.missiondz.api.users.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dz.missiondz.api.IntegrationTest;
import dz.missiondz.api.security.JwtService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
@AutoConfigureMockMvc
class PartnerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    void adminCanCreateListAndValidateAPartner() throws Exception {
        String adminToken = jwtService.generateAccessToken(UUID.randomUUID(), "ADMIN");
        String email = "garage." + System.nanoTime() + "@example.com";

        String createBody =
                """
                {"name":"Garage Ali","email":"%s","password":"motdepasse123","wilaya":"Alger","entreprise":"Garage Ali SARL","specialite":"Mécanique auto","tauxCommission":15.00}
                """
                        .formatted(email);

        String createResponse = mockMvc.perform(post("/api/admin/partners")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statutValidation").value("EN_ATTENTE"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String partnerId = createResponse.split("\"partnerId\":\"")[1].split("\"")[0];

        mockMvc.perform(get("/api/admin/partners").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == '" + email + "')]").exists());

        mockMvc.perform(post("/api/admin/partners/" + partnerId + "/validate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statutValidation").value("VALIDE"));
    }

    @Test
    void aClientCannotAccessPartnerEndpoints() throws Exception {
        String clientToken = jwtService.generateAccessToken(UUID.randomUUID(), "CLIENT");

        mockMvc.perform(get("/api/admin/partners").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void anUnauthenticatedRequestIsRejected() throws Exception {
        mockMvc.perform(get("/api/admin/partners")).andExpect(status().isUnauthorized());
    }
}
