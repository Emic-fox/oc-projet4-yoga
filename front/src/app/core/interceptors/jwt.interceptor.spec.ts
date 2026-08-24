import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { jwtInterceptor } from './jwt.interceptor';
import { SessionService } from '../services/session.service';
import { SessionInformation } from '../models/session-information.interface';

describe('jwtInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let sessionService: SessionService;

  const mockSessionInformation: SessionInformation = {
    token: 'my-jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'JohnDoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: false
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting()
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should add an Authorization header when the user is logged in', () => {
    sessionService.logIn(mockSessionInformation);

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockSessionInformation.token}`);

    req.flush(null);
  });

  it('should not add an Authorization header when the user is not logged in', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush(null);
  });
});
