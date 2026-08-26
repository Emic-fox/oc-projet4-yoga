package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.exception.UnauthorizedException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Tag("unit")
@Tag("service")
@DisplayName("UserService")
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user(long id) {
        return User.builder()
                .id(id)
                .email("yoga@studio.com")
                .firstName("Yoga")
                .lastName("Studio")
                .password("secret")
                .admin(false)
                .build();
    }

    @Test
    @DisplayName("findById() renvoie l'utilisateur quand il existe")
    void findById_returnsUser_whenItExists() {
        User user = user(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User result = userService.findById(1L);

        assertThat(result).isEqualTo(user);
    }

    @Test
    @DisplayName("findById() lève NotFoundException quand l'utilisateur est absent")
    void findById_throwsNotFoundException_whenUserIsMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(99L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("delete() supprime l'utilisateur quand le demandeur est le propriétaire du compte")
    void delete_removesUser_whenRequesterIsTheOwner() {
        User user = user(1L);

        userService.delete(user, 1L);

        verify(userRepository).delete(user);
    }

    @Test
    @DisplayName("delete() lève UnauthorizedException et ne supprime rien quand le demandeur n'est pas le propriétaire")
    void delete_throwsUnauthorizedException_whenRequesterIsNotTheOwner() {
        User user = user(1L);

        assertThatThrownBy(() -> userService.delete(user, 2L))
                .isInstanceOf(UnauthorizedException.class);

        verify(userRepository, never()).delete(user);
    }
}
