package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthService(AuthenticationManager authenticationManager,
                        PasswordEncoder passwordEncoder,
                        JwtUtils jwtUtils,
                        UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public LoginResult login(LoginRequest loginRequest) {
        Authentication authentication = this.authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = this.jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = this.userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found in database: " + userDetails.getUsername()));

        return new LoginResult(jwt, userDetails, user.isAdmin());
    }

    public void register(SignupRequest signUpRequest) {
        if (this.userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        User user = new User(signUpRequest.getEmail(),
                signUpRequest.getLastName(),
                signUpRequest.getFirstName(),
                this.passwordEncoder.encode(signUpRequest.getPassword()),
                false);

        this.userRepository.save(user);
    }

    public record LoginResult(String jwt, UserDetailsImpl userDetails, boolean isAdmin) {
    }
}
