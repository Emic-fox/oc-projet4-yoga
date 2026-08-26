package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Tag("unit")
@Tag("service")
@DisplayName("AuthService")
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Nested
    @DisplayName("login()")
    class Login {

        private UserDetailsImpl userDetails() {
            return UserDetailsImpl.builder()
                .id(1L)
                .username("yoga@studio.com")
                .firstName("Yoga")
                .lastName("Studio")
                .password("hashed")
                .build();
        }

        private User user(boolean admin) {
            return User.builder()
                .email("yoga@studio.com")
                .firstName("Yoga")
                .lastName("Studio")
                .password("hashed")
                .admin(admin)
                .build();
        }

        private Authentication authenticationFor(UserDetailsImpl principal) {
            return new UsernamePasswordAuthenticationToken(principal, null);
        }

        private LoginRequest loginRequest() {
            LoginRequest request = new LoginRequest();
            request.setEmail("yoga@studio.com");
            request.setPassword("password");
            return request;
        }

        @Test
        @DisplayName("authentifie, génère un JWT et renvoie le résultat avec le flag admin")
        void login_returnsJwtAndAdminFlag_whenCredentialsAreValid() {
            UserDetailsImpl principal = userDetails();
            when(authenticationManager.authenticate(any())).thenReturn(authenticationFor(principal));
            when(jwtUtils.generateJwtToken(any())).thenReturn("a-jwt-token");
            when(userRepository.findByEmail("yoga@studio.com")).thenReturn(Optional.of(user(true)));

            AuthService.LoginResult result = authService.login(loginRequest());

            assertThat(result.jwt()).isEqualTo("a-jwt-token");
            assertThat(result.userDetails()).isEqualTo(principal);
            assertThat(result.isAdmin()).isTrue();
        }

        @Test
        @DisplayName("renvoie isAdmin=false quand l'utilisateur authentifié n'est pas administrateur")
        void login_returnsAdminFalse_whenUserIsNotAdmin() {
            UserDetailsImpl principal = userDetails();
            when(authenticationManager.authenticate(any())).thenReturn(authenticationFor(principal));
            when(jwtUtils.generateJwtToken(any())).thenReturn("a-jwt-token");
            when(userRepository.findByEmail("yoga@studio.com")).thenReturn(Optional.of(user(false)));

            AuthService.LoginResult result = authService.login(loginRequest());

            assertThat(result.jwt()).isEqualTo("a-jwt-token");
            assertThat(result.userDetails()).isEqualTo(principal);
            assertThat(result.isAdmin()).isFalse();
        }

        @Test
        @DisplayName("lève IllegalStateException quand l'utilisateur authentifié est introuvable en base")
        void login_throwsIllegalStateException_whenUserNotFoundInRepository() {
            when(authenticationManager.authenticate(any())).thenReturn(authenticationFor(userDetails()));
            when(jwtUtils.generateJwtToken(any())).thenReturn("a-jwt-token");
            when(userRepository.findByEmail("yoga@studio.com")).thenReturn(Optional.empty());
            LoginRequest request = loginRequest();

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("place l'authentification dans le SecurityContext")
        void login_setsAuthenticationInSecurityContext() {
            Authentication authentication = authenticationFor(userDetails());
            when(authenticationManager.authenticate(any())).thenReturn(authentication);
            when(jwtUtils.generateJwtToken(any())).thenReturn("a-jwt-token");
            when(userRepository.findByEmail(any())).thenReturn(Optional.of(user(false)));

            authService.login(loginRequest());

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isEqualTo(authentication);
        }
    }

    @Nested
    @DisplayName("register()")
    class Register {

        private SignupRequest signupRequest(String email, String firstName, String lastName, String password) {
            SignupRequest request = new SignupRequest();
            request.setEmail(email);
            request.setFirstName(firstName);
            request.setLastName(lastName);
            request.setPassword(password);
            return request;
        }

        @Test
        @DisplayName("encode le mot de passe et sauvegarde un utilisateur non admin quand l'email est libre")
        void register_savesEncodedNonAdminUser_whenEmailIsFree() {
            SignupRequest request = signupRequest("new@studio.com", "New", "User", "plain-password");
            when(userRepository.existsByEmail("new@studio.com")).thenReturn(false);
            when(passwordEncoder.encode("plain-password")).thenReturn("encoded-password");

            authService.register(request);

            ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(saved.capture());
            assertThat(saved.getValue().getEmail()).isEqualTo("new@studio.com");
            assertThat(saved.getValue().getFirstName()).isEqualTo("New");
            assertThat(saved.getValue().getLastName()).isEqualTo("User");
            assertThat(saved.getValue().getPassword()).isEqualTo("encoded-password");
            assertThat(saved.getValue().isAdmin()).isFalse();
        }

        @Test
        @DisplayName("lève BadRequestException et ne sauvegarde rien quand l'email est déjà pris")
        void register_throwsBadRequestException_whenEmailAlreadyTaken() {
            SignupRequest request = signupRequest("taken@studio.com", "Taken", "User", "plain-password");
            when(userRepository.existsByEmail("taken@studio.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BadRequestException.class);

            verify(userRepository, never()).save(any());
        }
    }
}
