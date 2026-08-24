import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { AuthService } from './auth.service';
import { LoginRequest } from '../models/login-request.interface';
import { RegisterRequest } from '../models/register-request.interface';
import { SessionInformation } from '../models/session-information.interface';
import { environment } from 'src/environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  const pathService = `${environment.baseUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should send a POST request to the register endpoint with the register request payload', () => {
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      service.register(registerRequest).subscribe();

      const req = httpTestingController.expectOne(`${pathService}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);

      req.flush(null);
    });
  });

  describe('login', () => {
    it('should send a POST request to the login endpoint and return the session information', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const sessionInformation: SessionInformation = {
        token: 'token',
        type: 'Bearer',
        id: 1,
        username: 'JohnDoe',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      service.login(loginRequest).subscribe((response) => {
        expect(response).toEqual(sessionInformation);
      });

      const req = httpTestingController.expectOne(`${pathService}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);

      req.flush(sessionInformation);
    });
  });
});
