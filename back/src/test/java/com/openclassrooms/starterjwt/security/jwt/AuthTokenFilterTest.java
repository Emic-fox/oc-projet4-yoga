package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Tag("unit")
@Tag("security")
@DisplayName("AuthTokenFilter")
@ExtendWith(MockitoExtension.class)
class AuthTokenFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    private final MockHttpServletRequest request = new MockHttpServletRequest();
    private final MockHttpServletResponse response = new MockHttpServletResponse();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private UserDetailsImpl userDetails() {
        return UserDetailsImpl.builder()
                .id(1L)
                .username("yoga@studio.com")
                .firstName("Yoga")
                .lastName("Studio")
                .password("hashed")
                .build();
    }

    @Test
    @DisplayName("valorise le SecurityContext quand le header Bearer contient un JWT valide")
    void doFilter_setsAuthentication_whenTokenIsValid() throws Exception {
        request.addHeader("Authorization", "Bearer valid.jwt.token");
        UserDetailsImpl userDetails = userDetails();
        when(jwtUtils.validateJwtToken("valid.jwt.token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("valid.jwt.token")).thenReturn("yoga@studio.com");
        when(userDetailsService.loadUserByUsername("yoga@studio.com")).thenReturn(userDetails);

        authTokenFilter.doFilter(request, response, filterChain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(userDetails);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("ne valorise pas le SecurityContext quand aucun header Authorization n'est présent")
    void doFilter_doesNotAuthenticate_whenNoHeader() throws Exception {
        authTokenFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("ne valorise pas le SecurityContext quand le token est invalide")
    void doFilter_doesNotAuthenticate_whenTokenIsInvalid() throws Exception {
        request.addHeader("Authorization", "Bearer bad.token");
        when(jwtUtils.validateJwtToken("bad.token")).thenReturn(false);

        authTokenFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("ignore un header Authorization sans préfixe Bearer")
    void doFilter_doesNotAuthenticate_whenHeaderIsNotBearer() throws Exception {
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        authTokenFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("laisse passer la requête même si une exception survient pendant l'authentification")
    void doFilter_swallowsException_andContinuesChain() throws Exception {
        request.addHeader("Authorization", "Bearer valid.jwt.token");
        when(jwtUtils.validateJwtToken("valid.jwt.token")).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken("valid.jwt.token")).thenReturn("yoga@studio.com");
        when(userDetailsService.loadUserByUsername(any()))
                .thenThrow(new RuntimeException("boom"));

        authTokenFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}
