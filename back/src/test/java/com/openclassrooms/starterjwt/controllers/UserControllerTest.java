package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Transactional
@Tag("integration")
@Tag("controller")
@DisplayName("UserController (intégration)")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long currentUserId;
    private Long otherUserId;

    @BeforeEach
    void resetDatabase() {
        userRepository.deleteAll();

        currentUserId = userRepository.save(User.builder()
                .email("current@studio.com")
                .firstName("Current")
                .lastName("User")
                .password(passwordEncoder.encode("password!1"))
                .admin(false)
                .build()).getId();

        otherUserId = userRepository.save(User.builder()
                .email("other@studio.com")
                .firstName("Other")
                .lastName("User")
                .password(passwordEncoder.encode("password!1"))
                .admin(false)
                .build()).getId();
    }

    // Un token par email ; évite un login par test
    private static final Map<String, String> CACHED_TOKENS = new ConcurrentHashMap<>();

    private String bearerToken(String email) throws Exception {
        String cached = CACHED_TOKENS.get(email);
        if (cached != null) {
            return cached;
        }
        
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword("password!1");
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = "Bearer " + objectMapper.readTree(body).get("token").asText();
        CACHED_TOKENS.put(email, token);
        return token;
    }

    @ParameterizedTest(name = "{0} {1}")
    @CsvSource({
            "GET,    /api/user/1",
            "DELETE, /api/user/1"
    })
    @DisplayName("toutes les routes exigent un jeton (401 sinon)")
    void everyRoute_returns401_whenNotAuthenticated(String method, String path) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(method), path))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/user/{id} renvoie 200 et l'utilisateur demandé")
    void findById_returnsUser_whenExists() throws Exception {
        mockMvc.perform(get("/api/user/{id}", currentUserId)
                        .header("Authorization", bearerToken("current@studio.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(currentUserId))
                .andExpect(jsonPath("$.email").value("current@studio.com"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/user/{id} renvoie 404 quand l'utilisateur n'existe pas")
    void findById_returns404_whenNotFound() throws Exception {
        mockMvc.perform(get("/api/user/{id}", 999999)
                        .header("Authorization", bearerToken("current@studio.com")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/user/{id} renvoie 400 quand l'id n'est pas numérique")
    void findById_returns400_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(get("/api/user/{id}", "abc")
                        .header("Authorization", bearerToken("current@studio.com")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/user/{id} supprime son propre compte et renvoie 200")
    void delete_removesOwnAccount_whenIdMatchesAuthenticatedUser() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", currentUserId)
                        .header("Authorization", bearerToken("current@studio.com")))
                .andExpect(status().isOk());

        assertThat(userRepository.findById(currentUserId)).isEmpty();
    }

    @Test
    @DisplayName("DELETE /api/user/{id} renvoie 401 quand on tente de supprimer le compte d'un autre")
    void delete_returns401_whenDeletingAnotherAccount() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", otherUserId)
                        .header("Authorization", bearerToken("current@studio.com")))
                .andExpect(status().isUnauthorized());

        assertThat(userRepository.findById(otherUserId)).isPresent();
    }
}
