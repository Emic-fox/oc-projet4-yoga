package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
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
@DisplayName("TeacherController (intégration)")
class TeacherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long teacherId;

    // Évite un login par test
    private static String cachedToken;

    @BeforeEach
    void resetDatabase() {
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(User.builder()
                .email("user@studio.com")
                .firstName("Yoga")
                .lastName("Studio")
                .password(passwordEncoder.encode("password!1"))
                .admin(false)
                .build());

        teacherId = teacherRepository.save(Teacher.builder()
                .firstName("Margot")
                .lastName("Delahaye")
                .build()).getId();
        teacherRepository.save(Teacher.builder()
                .firstName("Helene")
                .lastName("Thiercelin")
                .build());
    }

    private String bearerToken() throws Exception {
        if (cachedToken == null) {
            LoginRequest request = new LoginRequest();
            request.setEmail("user@studio.com");
            request.setPassword("password!1");
            String body = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();
            cachedToken = "Bearer " + objectMapper.readTree(body).get("token").asText();
        }
        return cachedToken;
    }

    @ParameterizedTest(name = "{0} {1}")
    @CsvSource({
            "GET, /api/teacher",
            "GET, /api/teacher/1"
    })
    @DisplayName("toutes les routes exigent un jeton (401 sinon)")
    void everyRoute_returns401_whenNotAuthenticated(String method, String path) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(method), path))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/teacher renvoie 200 et la liste des enseignants")
    void findAll_returnsTeachers_whenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/teacher").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("GET /api/teacher/{id} renvoie 200 et l'enseignant demandé")
    void findById_returnsTeacher_whenExists() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", teacherId).header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacherId))
                .andExpect(jsonPath("$.lastName").value("Delahaye"));
    }

    @Test
    @DisplayName("GET /api/teacher/{id} renvoie 404 quand l'enseignant n'existe pas")
    void findById_returns404_whenNotFound() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", 999999).header("Authorization", bearerToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/teacher/{id} renvoie 400 quand l'id n'est pas numérique")
    void findById_returns400_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", "abc").header("Authorization", bearerToken()))
                .andExpect(status().isBadRequest());
    }
}
