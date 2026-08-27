package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@Tag("unit")
@Tag("security")
@Tag("service")
@DisplayName("UserDetailsServiceImpl")
@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private User user() {
        return User.builder()
                .id(1L)
                .email("yoga@studio.com")
                .firstName("Yoga")
                .lastName("Studio")
                .password("secret")
                .admin(false)
                .build();
    }

    @Test
    @DisplayName("loadUserByUsername() mappe l'utilisateur trouvé vers un UserDetailsImpl")
    void loadUserByUsername_mapsUser_whenItExists() {
        User user = user();
        when(userRepository.findByEmail("yoga@studio.com")).thenReturn(Optional.of(user));

        UserDetails result = userDetailsService.loadUserByUsername("yoga@studio.com");

        assertThat(result).isInstanceOf(UserDetailsImpl.class);
        UserDetailsImpl details = (UserDetailsImpl) result;
        assertThat(details.getId()).isEqualTo(1L);
        assertThat(details.getUsername()).isEqualTo("yoga@studio.com");
        assertThat(details.getFirstName()).isEqualTo("Yoga");
        assertThat(details.getLastName()).isEqualTo("Studio");
        assertThat(details.getPassword()).isEqualTo("secret");
    }

    @Test
    @DisplayName("loadUserByUsername() lève UsernameNotFoundException quand l'utilisateur est absent")
    void loadUserByUsername_throws_whenUserIsMissing() {
        when(userRepository.findByEmail("ghost@studio.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("ghost@studio.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("ghost@studio.com");
    }
}
