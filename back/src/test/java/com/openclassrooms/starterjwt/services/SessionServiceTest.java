package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Tag("unit")
@Tag("service")
@DisplayName("SessionService")
@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private User user(long id) {
        return User.builder()
                .id(id)
                .email("user" + id + "@studio.com")
                .firstName("First")
                .lastName("Last")
                .password("secret")
                .admin(false)
                .build();
    }

    private Session session(long id, User... participants) {
        List<User> users = new ArrayList<>(List.of(participants));
        return Session.builder()
                .id(id)
                .name("Yoga")
                .date(new Date())
                .description("Morning session")
                .users(users)
                .build();
    }

    @Test
    @DisplayName("create() sauvegarde la session et renvoie l'entité persistée")
    void create_savesSession_andReturnsIt() {
        Session session = session(1L);
        when(sessionRepository.save(session)).thenReturn(session);

        assertThat(sessionService.create(session)).isEqualTo(session);
    }

    @Test
    @DisplayName("delete() délègue la suppression au repository")
    void delete_delegatesToRepository() {
        Session session = session(1L);

        sessionService.delete(session);

        verify(sessionRepository).delete(session);
    }

    @Test
    @DisplayName("findAll() renvoie toutes les sessions fournies par le repository")
    void findAll_returnsAllSessions_fromRepository() {
        List<Session> sessions = List.of(session(1L), session(2L));
        when(sessionRepository.findAll()).thenReturn(sessions);

        assertThat(sessionService.findAll()).isEqualTo(sessions);
    }

    @Test
    @DisplayName("getById() renvoie la session quand elle existe")
    void getById_returnsSession_whenItExists() {
        Session session = session(1L);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThat(sessionService.getById(1L)).isEqualTo(session);
    }

    @Test
    @DisplayName("getById() lève NotFoundException quand la session est absente")
    void getById_throwsNotFoundException_whenSessionIsMissing() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.getById(99L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("update() force l'id fourni sur la session puis la sauvegarde")
    void update_setsGivenIdOnSession_andSaves() {
        Session session = session(1L);
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(session(5L)));
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.update(5L, session);

        assertThat(result).isEqualTo(session);
        assertThat(session.getId()).isEqualTo(5L);
    }

    @Test
    @DisplayName("update() lève NotFoundException quand la session ciblée n'existe pas")
    void update_throwsNotFoundException_whenSessionIsMissing() {
        Session session = session(1L);
        when(sessionRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.update(5L, session))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Nested
    @DisplayName("participate()")
    class Participate {

        @Test
        @DisplayName("ajoute l'utilisateur à la session quand il n'y participe pas encore")
        void participate_addsUserToSession_whenNotYetParticipating() {
            Session session = session(1L);
            User user = user(50L);
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
            when(userRepository.findById(50L)).thenReturn(Optional.of(user));

            sessionService.participate(1L, 50L);

            assertThat(session.getUsers()).containsExactly(user);
            verify(sessionRepository).save(session);
        }

        @Test
        @DisplayName("lève NotFoundException quand la session est absente")
        void participate_throwsNotFoundException_whenSessionIsMissing() {
            when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sessionService.participate(1L, 50L))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("lève NotFoundException quand l'utilisateur est absent")
        void participate_throwsNotFoundException_whenUserIsMissing() {
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session(1L)));
            when(userRepository.findById(50L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sessionService.participate(1L, 50L))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("lève BadRequestException quand l'utilisateur participe déjà")
        void participate_throwsBadRequestException_whenUserAlreadyParticipates() {
            User user = user(50L);
            Session session = session(1L, user);
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
            when(userRepository.findById(50L)).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> sessionService.participate(1L, 50L))
                    .isInstanceOf(BadRequestException.class);

            verify(sessionRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("noLongerParticipate()")
    class NoLongerParticipate {

        @Test
        @DisplayName("retire l'utilisateur de la session quand il y participe")
        void noLongerParticipate_removesUserFromSession_whenParticipating() {
            User user = user(50L);
            Session session = session(1L, user);
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

            sessionService.noLongerParticipate(1L, 50L);

            assertThat(session.getUsers()).isEmpty();
            verify(sessionRepository).save(session);
        }

        @Test
        @DisplayName("lève NotFoundException quand la session est absente")
        void noLongerParticipate_throwsNotFoundException_whenSessionIsMissing() {
            when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 50L))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("lève BadRequestException quand l'utilisateur ne participe pas")
        void noLongerParticipate_throwsBadRequestException_whenUserDoesNotParticipate() {
            Session session = session(1L, user(50L));
            when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

            assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 51L))
                    .isInstanceOf(BadRequestException.class);

            verify(sessionRepository, never()).save(any());
        }
    }
}
