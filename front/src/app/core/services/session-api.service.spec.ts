import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';
import { Session } from '../models/session.interface';
import { environment } from 'src/environments/environment';

describe('SessionsService', () => {
  let service: SessionApiService;
  let httpTestingController: HttpTestingController;

  const pathService = `${environment.baseUrl}/session`;

  const mockSession: Session = {
    id: 1,
    name: 'Yoga session',
    description: 'A relaxing yoga session',
    date: new Date(),
    teacher_id: 1,
    users: [1, 2]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(SessionApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should send a GET request and return the list of sessions', () => {
      const mockSessions: Session[] = [mockSession];

      service.all().subscribe((sessions) => {
        expect(sessions).toEqual(mockSessions);
      });

      const req = httpTestingController.expectOne(pathService);
      expect(req.request.method).toBe('GET');

      req.flush(mockSessions);
    });
  });

  describe('detail', () => {
    it('should send a GET request and return the session detail', () => {
      service.detail('1').subscribe((session) => {
        expect(session).toEqual(mockSession);
      });

      const req = httpTestingController.expectOne(`${pathService}/1`);
      expect(req.request.method).toBe('GET');

      req.flush(mockSession);
    });
  });

  describe('delete', () => {
    it('should send a DELETE request to the session endpoint', () => {
      service.delete('1').subscribe();

      const req = httpTestingController.expectOne(`${pathService}/1`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });

  describe('create', () => {
    it('should send a POST request with the session payload and return the created session', () => {
      service.create(mockSession).subscribe((session) => {
        expect(session).toEqual(mockSession);
      });

      const req = httpTestingController.expectOne(pathService);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSession);

      req.flush(mockSession);
    });
  });

  describe('update', () => {
    it('should send a PUT request with the session payload and return the updated session', () => {
      service.update('1', mockSession).subscribe((session) => {
        expect(session).toEqual(mockSession);
      });

      const req = httpTestingController.expectOne(`${pathService}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockSession);

      req.flush(mockSession);
    });
  });

  describe('participate', () => {
    it('should send a POST request to the participate endpoint with a null body', () => {
      service.participate('1', '2').subscribe();

      const req = httpTestingController.expectOne(`${pathService}/1/participate/2`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();

      req.flush(null);
    });
  });

  describe('unParticipate', () => {
    it('should send a DELETE request to the participate endpoint', () => {
      service.unParticipate('1', '2').subscribe();

      const req = httpTestingController.expectOne(`${pathService}/1/participate/2`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });
});
