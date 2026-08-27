package com.openclassrooms.starterjwt.security.jwt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("unit")
@Tag("security")
@DisplayName("AuthEntryPointJwt")
class AuthEntryPointJwtTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private AuthEntryPointJwt authEntryPointJwt;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        authEntryPointJwt = new AuthEntryPointJwt(objectMapper);
        request = new MockHttpServletRequest();
        request.setRequestURI("/api/session");
        response = new MockHttpServletResponse();
    }

    @Test
    @DisplayName("commence() répond 401 avec un ProblemDetail application/problem+json")
    void commence_writesProblemDetail_withUnauthorizedStatus() throws Exception {
        AuthenticationException exception = new BadCredentialsException("Bad credentials");

        authEntryPointJwt.commence(request, response, exception);

        assertThat(response.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.getContentType()).isEqualTo(MediaType.APPLICATION_PROBLEM_JSON_VALUE);

        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertThat(body.get("status").asInt()).isEqualTo(401);
        assertThat(body.get("detail").asText()).isEqualTo("Bad credentials");
        assertThat(body.get("instance").asText()).isEqualTo("/api/session");
    }

    @Test
    @DisplayName("commence() utilise le libellé standard quand le message de l'exception est null")
    void commence_fallsBackToReasonPhrase_whenExceptionMessageIsNull() throws Exception {
        AuthenticationException exception = new BadCredentialsException(null);

        authEntryPointJwt.commence(request, response, exception);

        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertThat(body.get("detail").asText()).isEqualTo(HttpStatus.UNAUTHORIZED.getReasonPhrase());
    }
}
