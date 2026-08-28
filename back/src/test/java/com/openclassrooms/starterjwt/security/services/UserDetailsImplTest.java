package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("unit")
@Tag("security")
@Tag("service")
@DisplayName("UserDetailsImpl")
class UserDetailsImplTest {

    private UserDetailsImpl user(Long id) {
        return UserDetailsImpl.builder()
                .id(id)
                .username("yoga@studio.com")
                .firstName("Yoga")
                .lastName("Studio")
                .admin(false)
                .password("secret")
                .build();
    }

    @Test
    @DisplayName("le builder alimente tous les champs")
    void builder_populatesAllFields() {
        UserDetailsImpl details = user(1L);

        assertThat(details.getId()).isEqualTo(1L);
        assertThat(details.getUsername()).isEqualTo("yoga@studio.com");
        assertThat(details.getFirstName()).isEqualTo("Yoga");
        assertThat(details.getLastName()).isEqualTo("Studio");
        assertThat(details.getAdmin()).isFalse();
        assertThat(details.getPassword()).isEqualTo("secret");
    }

    @Nested
    @DisplayName("equals()")
    class Equals {
        @Test
        @DisplayName("equals() est vrai pour la même instance")
        void equals_isTrue_forSameInstance() {
            UserDetailsImpl details = user(1L);
    
            assertThat(details.equals(details)).isTrue();
        }
    
        @Test
        @DisplayName("equals() est vrai quand les identifiants sont identiques")
        void equals_isTrue_whenIdsMatch() {
            assertThat(user(1L)).isEqualTo(user(1L));
        }
    
        @Test
        @DisplayName("equals() est faux quand les identifiants diffèrent")
        void equals_isFalse_whenIdsDiffer() {
            assertThat(user(1L)).isNotEqualTo(user(2L));
        }
    
        @Test
        @DisplayName("equals() est faux avec null ou un type différent")
        void equals_isFalse_forNullOrOtherType() {
            UserDetailsImpl details = user(1L);
    
            assertThat(details.equals(null)).isFalse();
            assertThat(details.equals("not a user")).isFalse();
        }
    }
}
