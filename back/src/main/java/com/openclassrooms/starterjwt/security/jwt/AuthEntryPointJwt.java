package com.openclassrooms.starterjwt.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;

// Builds the same ProblemDetail shape as GlobalExceptionHandler, so that a 401
// raised before a controller is reached (missing/invalid JWT) looks identical
// on the wire to a 401 raised from within one (UnauthorizedException).
@Slf4j
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

   private final ObjectMapper objectMapper;

   public AuthEntryPointJwt(ObjectMapper objectMapper) {
       this.objectMapper = objectMapper;
   }

   @Override
   public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
           throws IOException, ServletException {
       log.error("Unauthorized error: {}", authException.getMessage());

       String message = authException.getMessage() != null
               ? authException.getMessage()
               : HttpStatus.UNAUTHORIZED.getReasonPhrase();

       ProblemDetail body = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, message);
       body.setInstance(URI.create(request.getRequestURI()));

       response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
       response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

       objectMapper.writeValue(response.getOutputStream(), body);
   }

}
