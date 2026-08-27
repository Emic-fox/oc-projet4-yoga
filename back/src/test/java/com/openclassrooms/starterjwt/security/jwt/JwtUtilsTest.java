package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("unit")
@Tag("security")
@DisplayName("JwtUtils")
class JwtUtilsTest {

    // 256-bit key, base64-encoded, as expected by JwtUtils#key()
    private static final String JWT_SECRET = "dGhpcy1pcy1hLXRlc3Qtc2VjcmV0LWtleS1mb3Itand0LXVuaXQtdGVzdHMtMDE=";
    private static final int EXPIRATION = 3600000;

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = createJwtUtils(JWT_SECRET, EXPIRATION);
    }

    JwtUtils createJwtUtils(String secret, int expiration) {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", secret);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", expiration);
        return jwtUtils;
    }

    private Authentication authentication(String username) {
        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L)
                .username(username)
                .firstName("Yoga")
                .lastName("Studio")
                .password("hashed")
                .build();
        return new UsernamePasswordAuthenticationToken(principal, null);
    }

    @Test
    @DisplayName("generateJwtToken() puis getUserNameFromJwtToken() conservent le username")
    void generateAndParse_keepsUsername() {
        String token = jwtUtils.generateJwtToken(authentication("yoga@studio.com"));

        assertThat(jwtUtils.getUserNameFromJwtToken(token)).isEqualTo("yoga@studio.com");
    }

    @Test
    @DisplayName("validateJwtToken() renvoie true pour un token fraîchement généré")
    void validateJwtToken_returnsTrue_forValidToken() {
        String token = jwtUtils.generateJwtToken(authentication("yoga@studio.com"));

        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
    }

    @Test
    @DisplayName("validateJwtToken() renvoie false pour un token malformé")
    void validateJwtToken_returnsFalse_forMalformedToken() {
        assertThat(jwtUtils.validateJwtToken("not-a-jwt")).isFalse();
    }

    @Test
    @DisplayName("validateJwtToken() renvoie false pour une chaîne vide")
    void validateJwtToken_returnsFalse_forEmptyString() {
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }

    @Test
    @DisplayName("validateJwtToken() renvoie false quand la signature ne correspond pas au secret")
    void validateJwtToken_returnsFalse_forWrongSignature() {
        String token = jwtUtils.generateJwtToken(authentication("yoga@studio.com"));

        JwtUtils other = createJwtUtils("YW5vdGhlci10ZXN0LXNlY3JldC1rZXktZm9yLWp3dC11bml0LXRlc3RzLTAyMg==", EXPIRATION);

        assertThat(other.validateJwtToken(token)).isFalse();
    }

    @Test
    @DisplayName("validateJwtToken() renvoie false pour un token expiré")
    void validateJwtToken_returnsFalse_forExpiredToken() {
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -1000);
        String expired = jwtUtils.generateJwtToken(authentication("yoga@studio.com"));

        assertThat(jwtUtils.validateJwtToken(expired)).isFalse();
    }
}
