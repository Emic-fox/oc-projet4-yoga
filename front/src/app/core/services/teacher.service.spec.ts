import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { TeacherService } from './teacher.service';
import { Teacher } from '../models/teacher.interface';
import { environment } from 'src/environments/environment';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpTestingController: HttpTestingController;

  const pathService = `${environment.baseUrl}/teacher`;

  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'Doe',
    firstName: 'John',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TeacherService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should send a GET request and return the list of teachers', () => {
      const mockTeachers: Teacher[] = [mockTeacher];

      service.all().subscribe((teachers) => {
        expect(teachers).toEqual(mockTeachers);
      });

      const req = httpTestingController.expectOne(pathService);
      expect(req.request.method).toBe('GET');

      req.flush(mockTeachers);
    });
  });

  describe('detail', () => {
    it('should send a GET request and return the teacher detail', () => {
      service.detail('1').subscribe((teacher) => {
        expect(teacher).toEqual(mockTeacher);
      });

      const req = httpTestingController.expectOne(`${pathService}/1`);
      expect(req.request.method).toBe('GET');

      req.flush(mockTeacher);
    });
  });
});
