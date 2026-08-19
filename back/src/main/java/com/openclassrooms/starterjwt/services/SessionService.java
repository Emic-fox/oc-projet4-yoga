package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SessionService {
    private final SessionRepository sessionRepository;

    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public Session create(Session session) {
        return this.sessionRepository.save(session);
    }

    public void delete(Session session) {
        this.sessionRepository.delete(session);
    }

    public List<Session> findAll() {
        return this.sessionRepository.findAll();
    }

    public Session getById(Long id) {
        return this.sessionRepository.findById(id).orElseThrow(NotFoundException::new);
    }

    public Session update(Long id, Session session) {
        this.getById(id); // Vérifie l'existence de la session
        session.setId(id);
        return this.sessionRepository.save(session);
    }

    public void participate(Long id, Long userId) {
        Session session = this.sessionRepository.findById(id).orElseThrow(NotFoundException::new);
        User user = this.userRepository.findById(userId).orElseThrow(NotFoundException::new);

        boolean alreadyParticipate = session.getUsers().stream().anyMatch(u -> u.getId().equals(userId));
        if (alreadyParticipate) {
            throw new BadRequestException();
        }

        session.getUsers().add(user);

        this.sessionRepository.save(session);
    }

    public void noLongerParticipate(Long id, Long userId) {
        Session session = this.sessionRepository.findById(id).orElseThrow(NotFoundException::new);
        
        boolean alreadyParticipate = session.getUsers().removeIf(u -> u.getId().equals(userId));
        if (!alreadyParticipate) {
            throw new BadRequestException();
        }

        this.sessionRepository.save(session);
    }
}
