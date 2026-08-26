package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@Tag("unit")
@Tag("service")
@DisplayName("TeacherService")
@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    private Teacher teacher(long id, String firstName, String lastName) {
        return Teacher.builder().id(id).firstName(firstName).lastName(lastName).build();
    }

    @Test
    @DisplayName("findAll() renvoie tous les enseignants fournis par le repository")
    void findAll_returnsAllTeachers_fromRepository() {
        Teacher margot = teacher(1L, "Margot", "Delahaye");
        Teacher helene = teacher(2L, "Hélène", "Thiercelin");
        when(teacherRepository.findAll()).thenReturn(List.of(margot, helene));

        List<Teacher> result = teacherService.findAll();

        assertThat(result).containsExactly(margot, helene);
    }

    @Test
    @DisplayName("findAll() renvoie une liste vide quand aucun enseignant n'existe")
    void findAll_returnsEmptyList_whenNoTeacherExists() {
        when(teacherRepository.findAll()).thenReturn(List.of());

        assertThat(teacherService.findAll()).isEmpty();
    }

    @Test
    @DisplayName("findById() renvoie l'enseignant quand il existe")
    void findById_returnsTeacher_whenItExists() {
        Teacher margot = teacher(1L, "Margot", "Delahaye");
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(margot));

        Teacher result = teacherService.findById(1L);

        assertThat(result).isEqualTo(margot);
    }

    @Test
    @DisplayName("findById() lève NotFoundException quand l'enseignant est absent")
    void findById_throwsNotFoundException_whenTeacherIsMissing() {
        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.findById(99L))
                .isInstanceOf(NotFoundException.class);
    }
}
