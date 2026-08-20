package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Maps between {@link Session} and {@link SessionDto}.
 * <p>
 * {@code SessionDto} only carries the raw {@code teacher_id} / {@code users} ids, while
 * {@code Session} holds the actual JPA relations ({@link com.openclassrooms.starterjwt.models.Teacher}
 * and {@link User} entities). This mapper resolves those ids against
 * {@link TeacherRepository} / {@link UserRepository} on the way to an entity, and does the
 * reverse (entity -> id) on the way to a DTO. Any id that doesn't match an existing row is
 * silently dropped rather than raising an error.
 */
@Component
@Mapper(componentModel = "spring")
public abstract class SessionMapper implements EntityMapper<SessionDto, Session> {

    // MapStruct always generates a no-arg constructor for the abstract mapper's
    // implementation, so constructor injection isn't available here - field
    // injection is the pattern MapStruct itself documents for this case.
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private UserRepository userRepository;

    /**
     * Converts a {@link SessionDto} into a {@link Session} entity, resolving
     * {@code teacher_id} and {@code users} against the database.
     *
     * @param sessionDto the DTO to convert; must not be {@code null}
     * @return the corresponding {@link Session} entity
     */
    @Override
    @Mapping(target = "teacher", expression = "java(resolveTeacher(sessionDto.getTeacherId()))")
    @Mapping(target = "users", expression = "java(resolveUsers(sessionDto.getUsers()))")
    public abstract Session toEntity(SessionDto sessionDto);

    /**
     * Converts a {@link Session} entity into a {@link SessionDto}, flattening the related
     * {@code teacher} and {@code users} entities down to their ids.
     *
     * @param session the entity to convert; must not be {@code null}
     * @return the corresponding {@link SessionDto}
     */
    @Override
    @Mapping(source = "session.teacher.id", target = "teacherId")
    @Mapping(target = "users", expression = "java(mapUserIds(session.getUsers()))")
    public abstract SessionDto toDto(Session session);

    /**
     * Resolves a teacher id to its entity.
     *
     * @param teacherId the id to resolve, may be {@code null}
     * @return the matching {@link com.openclassrooms.starterjwt.models.Teacher}, or
     *         {@code null} if {@code teacherId} is {@code null} or doesn't match any row
     */
    protected com.openclassrooms.starterjwt.models.Teacher resolveTeacher(Long teacherId) {
        if (teacherId == null) {
            return null;
        }
        return teacherRepository.findById(teacherId).orElse(null);
    }

    /**
     * Resolves a list of user ids to their entities in a single query. Any id that doesn't
     * match an existing row is silently dropped from the result.
     *
     * @param userIds the ids to resolve, may be {@code null} (treated as empty)
     * @return the matching {@link User} entities, never {@code null}
     */
    protected List<User> resolveUsers(List<Long> userIds) {
        List<Long> ids = Optional.ofNullable(userIds).orElseGet(Collections::emptyList);
        return userRepository.findAllById(ids);
    }

    /**
     * Flattens a list of users down to their ids.
     *
     * @param users the entities to convert, may be {@code null} (treated as empty)
     * @return the corresponding ids, never {@code null}
     */
    protected List<Long> mapUserIds(List<User> users) {
        return Optional.ofNullable(users).orElseGet(Collections::emptyList).stream()
                .map(User::getId)
                .toList();
    }
}
