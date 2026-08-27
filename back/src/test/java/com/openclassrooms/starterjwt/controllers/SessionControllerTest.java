package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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

import java.util.ArrayList;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Transactional
@Tag("integration")
@Tag("controller")
@DisplayName("SessionController (intégration)")
class SessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long teacherId;
    private Long otherTeacherId;
    private Long userId;
    private Long sessionId;

    // Évite un login par test
    private static String cachedToken;

    @BeforeEach
    void resetDatabase() {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        teacherId = teacherRepository.save(Teacher.builder()
                .firstName("Margot")
                .lastName("Delahaye")
                .build()).getId();

        // Session.teacher est @OneToOne : un enseignant ne peut porter qu'une session.
        // On en garde un second, libre, pour le test de création.
        otherTeacherId = teacherRepository.save(Teacher.builder()
                .firstName("Helene")
                .lastName("Thiercelin")
                .build()).getId();

        userId = userRepository.save(User.builder()
                .email("user@studio.com")
                .firstName("Yoga")
                .lastName("Studio")
                .password(passwordEncoder.encode("password!1"))
                .admin(false)
                .build()).getId();

        sessionId = sessionRepository.save(Session.builder()
                .name("Morning flow")
                .date(new Date())
                .description("Séance douce du matin")
                .teacher(teacherRepository.findById(teacherId).orElseThrow())
                .users(new ArrayList<>())
                .build()).getId();
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

    private SessionDto sessionDto() {
        SessionDto dto = new SessionDto();
        dto.setName("Evening stretch");
        dto.setDate(new Date());
        dto.setTeacherId(otherTeacherId);
        dto.setDescription("Étirements du soir");
        return dto;
    }

    @ParameterizedTest(name = "{0} {1}")
    @CsvSource({
            "GET,    /api/session",
            "GET,    /api/session/1",
            "POST,   /api/session",
            "PUT,    /api/session/1",
            "DELETE, /api/session/1",
            "POST,   /api/session/1/participate/1",
            "DELETE, /api/session/1/participate/1"
    })
    @DisplayName("toutes les routes exigent un jeton (401 sinon)")
    void everyRoute_returns401_whenNotAuthenticated(String method, String path) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(method), path))
                .andExpect(status().isUnauthorized());
    }

    @Nested
    @DisplayName("lecture")
    class Read {

        @Test
        @DisplayName("GET /api/session renvoie 200 et la liste des sessions")
        void findAll_returnsSessions() throws Exception {
            mockMvc.perform(get("/api/session").header("Authorization", bearerToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1));
        }

        @Test
        @DisplayName("GET /api/session/{id} renvoie 200 et la session demandée")
        void findById_returnsSession_whenExists() throws Exception {
            mockMvc.perform(get("/api/session/{id}", sessionId).header("Authorization", bearerToken()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(sessionId))
                    .andExpect(jsonPath("$.name").value("Morning flow"))
                    .andExpect(jsonPath("$.teacher_id").value(teacherId));
        }

        @Test
        @DisplayName("GET /api/session/{id} renvoie 404 quand la session n'existe pas")
        void findById_returns404_whenNotFound() throws Exception {
            mockMvc.perform(get("/api/session/{id}", 999999).header("Authorization", bearerToken()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("GET /api/session/{id} renvoie 400 quand l'id n'est pas numérique")
        void findById_returns400_whenIdIsNotNumeric() throws Exception {
            mockMvc.perform(get("/api/session/{id}", "abc").header("Authorization", bearerToken()))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("écriture")
    class Write {

        @Test
        @DisplayName("POST /api/session crée la session, renvoie 200 et la persiste")
        void create_persistsSession_whenPayloadIsValid() throws Exception {
            mockMvc.perform(post("/api/session")
                            .header("Authorization", bearerToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sessionDto())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Evening stretch"));

            assertThat(sessionRepository.findAll()).hasSize(2);
        }

        @Test
        @DisplayName("POST /api/session renvoie 400 quand le corps est invalide (nom manquant)")
        void create_returns400_whenPayloadIsInvalid() throws Exception {
            SessionDto invalid = sessionDto();
            invalid.setName(null);

            mockMvc.perform(post("/api/session")
                            .header("Authorization", bearerToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("PUT /api/session/{id} met à jour la session et renvoie 200")
        void update_updatesSession_whenExists() throws Exception {
            SessionDto dto = sessionDto();
            dto.setName("Updated name");

            mockMvc.perform(put("/api/session/{id}", sessionId)
                            .header("Authorization", bearerToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated name"));

            assertThat(sessionRepository.findById(sessionId).orElseThrow().getName()).isEqualTo("Updated name");
        }

        @Test
        @DisplayName("PUT /api/session/{id} renvoie 404 quand la session n'existe pas")
        void update_returns404_whenNotFound() throws Exception {
            mockMvc.perform(put("/api/session/{id}", 999999)
                            .header("Authorization", bearerToken())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sessionDto())))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("DELETE /api/session/{id} supprime la session et renvoie 200")
        void delete_removesSession_whenExists() throws Exception {
            mockMvc.perform(delete("/api/session/{id}", sessionId).header("Authorization", bearerToken()))
                    .andExpect(status().isOk());

            assertThat(sessionRepository.findById(sessionId)).isEmpty();
        }

        @Test
        @DisplayName("DELETE /api/session/{id} renvoie 404 quand la session n'existe pas")
        void delete_returns404_whenNotFound() throws Exception {
            mockMvc.perform(delete("/api/session/{id}", 999999).header("Authorization", bearerToken()))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("participation")
    class Participation {

        @Test
        @DisplayName("POST .../participate/... inscrit l'utilisateur et renvoie 200")
        void participate_addsUser_whenNotAlreadyParticipating() throws Exception {
            mockMvc.perform(post("/api/session/{id}/participate/{userId}", sessionId, userId)
                            .header("Authorization", bearerToken()))
                    .andExpect(status().isOk());

            Session session = sessionRepository.findById(sessionId).orElseThrow();
            assertThat(session.getUsers()).extracting(User::getId).contains(userId);
        }

        @Test
        @DisplayName("POST .../participate/... renvoie 400 quand l'utilisateur participe déjà")
        void participate_returns400_whenAlreadyParticipating() throws Exception {
            mockMvc.perform(post("/api/session/{id}/participate/{userId}", sessionId, userId)
                    .header("Authorization", bearerToken())).andExpect(status().isOk());

            mockMvc.perform(post("/api/session/{id}/participate/{userId}", sessionId, userId)
                            .header("Authorization", bearerToken()))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("POST .../participate/... renvoie 404 quand la session n'existe pas")
        void participate_returns404_whenSessionNotFound() throws Exception {
            mockMvc.perform(post("/api/session/{id}/participate/{userId}", 999999, userId)
                            .header("Authorization", bearerToken()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("DELETE .../participate/... désinscrit l'utilisateur et renvoie 200")
        void noLongerParticipate_removesUser_whenParticipating() throws Exception {
            mockMvc.perform(post("/api/session/{id}/participate/{userId}", sessionId, userId)
                    .header("Authorization", bearerToken())).andExpect(status().isOk());

            mockMvc.perform(delete("/api/session/{id}/participate/{userId}", sessionId, userId)
                            .header("Authorization", bearerToken()))
                    .andExpect(status().isOk());

            Session session = sessionRepository.findById(sessionId).orElseThrow();
            assertThat(session.getUsers()).extracting(User::getId).doesNotContain(userId);
        }

        @Test
        @DisplayName("DELETE .../participate/... renvoie 400 quand l'utilisateur ne participe pas")
        void noLongerParticipate_returns400_whenNotParticipating() throws Exception {
            mockMvc.perform(delete("/api/session/{id}/participate/{userId}", sessionId, userId)
                            .header("Authorization", bearerToken()))
                    .andExpect(status().isBadRequest());
        }
    }
}
