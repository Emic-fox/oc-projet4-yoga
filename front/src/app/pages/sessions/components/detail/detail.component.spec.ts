import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { Session } from 'src/app/core/models/session.interface';
import { Teacher } from 'src/app/core/models/teacher.interface';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { DetailComponent } from './detail.component';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let httpTestingController: HttpTestingController;
  let router: Router;
  let snackBarOpenSpy: jest.SpiedFunction<MatSnackBar['open']>;

  const sessionPath = `${environment.baseUrl}/session`;
  const teacherPath = `${environment.baseUrl}/teacher`;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  };

  const buildSession = (overrides: Partial<Session> = {}): Session => ({
    id: 1,
    name: 'Yoga session',
    description: 'A relaxing yoga session',
    date: new Date('2023-06-01'),
    teacher_id: 1,
    users: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    ...overrides
  });

  const buildTeacher = (overrides: Partial<Teacher> = {}): Teacher => ({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2022-01-02'),
    ...overrides
  });

  const flushSessionAndTeacher = (session: Session, teacher: Teacher): void => {
    const sessionReq = httpTestingController.expectOne(`${sessionPath}/1`);
    expect(sessionReq.request.method).toBe('GET');
    sessionReq.flush(session);

    const teacherReq = httpTestingController.expectOne(`${teacherPath}/${session.teacher_id}`);
    expect(teacherReq.request.method).toBe('GET');
    teacherReq.flush(teacher);

    fixture.detectChanges();
  };

  const getDeleteButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-testid="delete-session-button"] button');
  const getParticipateButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-testid="participate-button"] button');
  const getUnParticipateButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-testid="unparticipate-button"] button');
  const getTeacherName = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="teacher-name"]');
  const getAttendeesCount = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="attendees-count"]');

  const createComponent = (): void => {
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockSessionService.sessionInformation = { admin: true, id: 1 };
    snackBarOpenSpy = jest.spyOn(MatSnackBar.prototype, 'open').mockReturnValue({} as ReturnType<MatSnackBar['open']>);

    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } }
      ]
    })
      .compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTestingController.verify();
    snackBarOpenSpy.mockRestore();
  });

  it('should create', () => {
    createComponent();
    flushSessionAndTeacher(buildSession(), buildTeacher());
    expect(component).toBeTruthy();
  });

  it('should fetch the session and its teacher by id', () => {
    createComponent();
    flushSessionAndTeacher(buildSession(), buildTeacher());
  });

  it('should display the teacher name and the attendees count once loaded', () => {
    createComponent();
    flushSessionAndTeacher(buildSession({ users: [1, 2, 3] }), buildTeacher({ firstName: 'Jane', lastName: 'Smith' }));

    expect(getTeacherName()?.textContent).toContain('Jane');
    expect(getTeacherName()?.textContent).toContain('SMITH');
    expect(getAttendeesCount()?.textContent).toContain('3 attendees');
  });

  describe('when the user is admin', () => {
    it('should display the delete button and not the participate buttons', () => {
      createComponent();
      flushSessionAndTeacher(buildSession(), buildTeacher());

      expect(getDeleteButton()).toBeTruthy();
      expect(getParticipateButton()).toBeNull();
      expect(getUnParticipateButton()).toBeNull();
    });

    it('should delete the session, notify and navigate to sessions on delete', () => {
      createComponent();
      flushSessionAndTeacher(buildSession(), buildTeacher());
      const navigateSpy = jest.spyOn(router, 'navigate');

      getDeleteButton()?.click();
      fixture.detectChanges();

      const deleteReq = httpTestingController.expectOne(`${sessionPath}/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      expect(snackBarOpenSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('when the user is not admin and not participating', () => {
    beforeEach(() => {
      mockSessionService.sessionInformation = { admin: false, id: 1 };
    });

    it('should display the participate button', () => {
      createComponent();
      flushSessionAndTeacher(buildSession({ users: [42] }), buildTeacher());

      expect(getDeleteButton()).toBeNull();
      expect(getParticipateButton()).toBeTruthy();
      expect(getUnParticipateButton()).toBeNull();
    });

    it('should participate and refresh the session on click', () => {
      createComponent();
      flushSessionAndTeacher(buildSession({ users: [] }), buildTeacher());

      getParticipateButton()?.click();
      fixture.detectChanges();

      const participateReq = httpTestingController.expectOne(`${sessionPath}/1/participate/1`);
      expect(participateReq.request.method).toBe('POST');
      participateReq.flush(null);

      flushSessionAndTeacher(buildSession({ users: [1] }), buildTeacher());

      expect(getUnParticipateButton()).toBeTruthy();
    });
  });

  describe('when the user is not admin and already participating', () => {
    beforeEach(() => {
      mockSessionService.sessionInformation = { admin: false, id: 1 };
    });

    it('should display the do-not-participate button', () => {
      createComponent();
      flushSessionAndTeacher(buildSession({ users: [1] }), buildTeacher());

      expect(getUnParticipateButton()).toBeTruthy();
      expect(getParticipateButton()).toBeNull();
    });

    it('should unparticipate and refresh the session on click', () => {
      createComponent();
      flushSessionAndTeacher(buildSession({ users: [1] }), buildTeacher());

      getUnParticipateButton()?.click();
      fixture.detectChanges();

      const unParticipateReq = httpTestingController.expectOne(`${sessionPath}/1/participate/1`);
      expect(unParticipateReq.request.method).toBe('DELETE');
      unParticipateReq.flush(null);

      flushSessionAndTeacher(buildSession({ users: [] }), buildTeacher());

      expect(getParticipateButton()).toBeTruthy();
    });
  });
});
