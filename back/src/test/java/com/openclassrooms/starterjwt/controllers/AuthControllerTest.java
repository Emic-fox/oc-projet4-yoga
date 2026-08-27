package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Transactional
@Tag("integration")
@Tag("controller")
@DisplayName("AuthController (intégration)")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void resetDatabase() {
        userRepository.deleteAll();
    }

    private void persistUser(String email, String rawPassword) {
        userRepository.save(User.builder()
                .email(email)
                .firstName("Yoga")
                .lastName("Studio")
                .password(passwordEncoder.encode(rawPassword))
                .admin(false)
                .build());
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    private SignupRequest signupRequest(String email, String firstName, String lastName, String password) {
        SignupRequest request = new SignupRequest();
        request.setEmail(email);
        request.setFirstName(firstName);
        request.setLastName(lastName);
        request.setPassword(password);
        return request;
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class Login {

        @Test
        @DisplayName("renvoie 200 avec un token et les infos utilisateur quand les identifiants sont valides")
        void returnsTokenAndUserInfo_whenCredentialsAreValid() throws Exception {
            persistUser("user@studio.com", "password!1");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(loginRequest("user@studio.com", "password!1"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.type").value("Bearer"))
                    .andExpect(jsonPath("$.username").value("user@studio.com"))
                    .andExpect(jsonPath("$.admin").value(false));
        }

        @Test
        @DisplayName("renvoie 401 quand le mot de passe est incorrect")
        void returns401_whenPasswordIsWrong() throws Exception {
            persistUser("user@studio.com", "password!1");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(loginRequest("user@studio.com", "wrong-password"))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("renvoie 401 quand l'utilisateur n'existe pas")
        void returns401_whenUserDoesNotExist() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(loginRequest("unknown@studio.com", "whatever1"))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("renvoie 400 quand la requête est invalide (email vide)")
        void returns400_whenPayloadIsInvalid() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(loginRequest("", ""))))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/register")
    class Register {

        @Test
        @DisplayName("renvoie 200, persiste l'utilisateur et encode le mot de passe")
        void returns200AndPersistsUser_whenPayloadIsValid() throws Exception {
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(signupRequest("new@studio.com", "New", "User", "password!1"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("User registered successfully!"));

            User saved = userRepository.findByEmail("new@studio.com").orElseThrow();
            assertThat(saved.getFirstName()).isEqualTo("New");
            assertThat(saved.isAdmin()).isFalse();
            assertThat(saved.getPassword()).isNotEqualTo("password!1");
        }

        @Test
        @DisplayName("renvoie 400 quand l'email est déjà utilisé")
        void returns400_whenEmailAlreadyUsed() throws Exception {
            persistUser("taken@studio.com", "password!1");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(signupRequest("taken@studio.com", "Taken", "User", "password!1"))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("renvoie 400 quand la requête est invalide (mot de passe trop court)")
        void returns400_whenPayloadIsInvalid() throws Exception {
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(signupRequest("bad@studio.com", "Bad", "User", "123"))))
                    .andExpect(status().isBadRequest());
        }
    }
}
