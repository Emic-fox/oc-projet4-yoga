import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import { User } from '../models/user.interface';
import { environment } from 'src/environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  const pathService = `${environment.baseUrl}/user`;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    lastName: 'Doe',
    firstName: 'John',
    admin: false,
    password: 'password123',
    createdAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should send a GET request and return the user', () => {
      service.getById('1').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpTestingController.expectOne(`${pathService}/1`);
      expect(req.request.method).toBe('GET');

      req.flush(mockUser);
    });
  });

  describe('delete', () => {
    it('should send a DELETE request to the user endpoint', () => {
      service.delete('1').subscribe();

      const req = httpTestingController.expectOne(`${pathService}/1`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });
  });
});
