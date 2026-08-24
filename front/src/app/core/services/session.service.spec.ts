import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionService } from './session.service';
import { SessionInformation } from '../models/session-information.interface';

const SESSION_STORAGE_KEY = 'sessionInformation';

describe('SessionService', () => {
  let service: SessionService;

  const mockSessionInformation: SessionInformation = {
    token: 'token',
    type: 'Bearer',
    id: 1,
    username: 'JohnDoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: false
  };

  function configureTestingModule() {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  }

  beforeEach(() => {
    localStorage.clear();
    configureTestingModule();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be logged in and have no session information by default', () => {
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  describe('logIn', () => {
    it('should set the session information, set isLogged to true and persist it to localStorage', () => {
      service.logIn(mockSessionInformation);

      expect(service.sessionInformation).toEqual(mockSessionInformation);
      expect(service.isLogged).toBe(true);
      expect(localStorage.getItem(SESSION_STORAGE_KEY)).toEqual(JSON.stringify(mockSessionInformation));
    });

    it('should emit true on $isLogged() when logging in', (done) => {
      service.$isLogged().subscribe((isLogged) => {
        if (isLogged) {
          expect(isLogged).toBe(true);
          done();
        }
      });

      service.logIn(mockSessionInformation);
    });
  });

  describe('logOut', () => {
    it('should clear the session information, set isLogged to false and remove it from localStorage', () => {
      service.logIn(mockSessionInformation);

      service.logOut();

      expect(service.sessionInformation).toBeUndefined();
      expect(service.isLogged).toBe(false);
      expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    });

    it('should emit false on $isLogged() when logging out', (done) => {
      service.logIn(mockSessionInformation);

      let emissionCount = 0;
      service.$isLogged().subscribe((isLogged) => {
        emissionCount++;
        // First emission is the current value (true, from logIn), second is after logOut (false)
        if (emissionCount === 2) {
          expect(isLogged).toBe(false);
          done();
        }
      });

      service.logOut();
    });
  });

  describe('restoreSession', () => {
    it('should restore the session information from localStorage on creation', () => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mockSessionInformation));

      TestBed.resetTestingModule();
      configureTestingModule();

      expect(service.sessionInformation).toEqual(mockSessionInformation);
      expect(service.isLogged).toBe(true);
    });

    it('should clear malformed data from localStorage and start logged out', () => {
      localStorage.setItem(SESSION_STORAGE_KEY, 'not-valid-json');

      TestBed.resetTestingModule();
      configureTestingModule();

      expect(service.sessionInformation).toBeUndefined();
      expect(service.isLogged).toBe(false);
      expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    });
  });
});
