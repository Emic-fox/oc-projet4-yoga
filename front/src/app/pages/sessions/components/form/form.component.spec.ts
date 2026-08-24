import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { Session } from 'src/app/core/models/session.interface';
import { Teacher } from 'src/app/core/models/teacher.interface';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
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
    id: 5,
    name: 'Yoga session',
    description: 'A relaxing yoga session',
    date: new Date('2023-06-01'),
    teacher_id: 1,
    users: [],
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

  const getNameInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="name-input"]');
  const getDateInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="date-input"]');
  const getDescriptionTextarea = (): HTMLTextAreaElement =>
    fixture.nativeElement.querySelector('[data-testid="description-textarea"]');
  const getSubmitButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-testid="submit-button"]');

  const writeFieldValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  const setInputValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
    writeFieldValue(input, value);
    fixture.detectChanges();
  };

  const fillValidForm = (): void => {
    writeFieldValue(getNameInput(), 'Yoga session');
    writeFieldValue(getDateInput(), '2023-06-01');
    component.sessionForm?.controls.teacher_id.setValue(1);
    writeFieldValue(getDescriptionTextarea(), 'A relaxing yoga session');
    fixture.detectChanges();
  };

  const flushTeachers = (teachers: Teacher[] = [buildTeacher()]): void => {
    const req = httpTestingController.expectOne(teacherPath);
    expect(req.request.method).toBe('GET');
    req.flush(teachers);
    fixture.detectChanges();
  };

  const configureTestBed = async (routeId: string | null = null): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [
        FormComponent,
        BrowserAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(routeId ? { id: routeId } : {}) } }
        }
      ]
    })
      .compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  };

  const createComponent = (url: string, beforeInit?: () => void): void => {
    jest.spyOn(router, 'url', 'get').mockReturnValue(url);
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    beforeInit?.();
    fixture.detectChanges();
  };

  beforeEach(() => {
    mockSessionService.sessionInformation = { admin: true, id: 1 };
    snackBarOpenSpy = jest.spyOn(MatSnackBar.prototype, 'open').mockReturnValue({} as ReturnType<MatSnackBar['open']>);
  });

  afterEach(() => {
    httpTestingController.verify();
    snackBarOpenSpy.mockRestore();
  });

  describe('create mode', () => {
    beforeEach(async () => {
      await configureTestBed();
      createComponent('/sessions/create');
    });

    it('should create', () => {
      flushTeachers();
      expect(component).toBeTruthy();
    });

    it('should initialize an empty form and load the teachers list', () => {
      flushTeachers([buildTeacher({ id: 1, firstName: 'John', lastName: 'Doe' })]);

      expect(component.onUpdate).toBe(false);
      expect(getNameInput().value).toBe('');
      expect(getSubmitButton()?.disabled).toBe(true);
    });

    it('should enable the submit button once all fields are filled', () => {
      flushTeachers();

      fillValidForm();

      expect(component.sessionForm?.valid).toBe(true);
      expect(getSubmitButton()?.disabled).toBe(false);
    });

    it('should create the session and navigate to sessions on submit', () => {
      flushTeachers();
      const navigateSpy = jest.spyOn(router, 'navigate');

      fillValidForm();

      getSubmitButton()?.click();
      fixture.detectChanges();

      const req = httpTestingController.expectOne(sessionPath);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: 'Yoga session',
        date: new Date('2023-06-01'),
        teacher_id: 1,
        description: 'A relaxing yoga session',
        users: []
      });
      req.flush(buildSession());

      expect(snackBarOpenSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('update mode', () => {
    beforeEach(async () => {
      await configureTestBed('5');
      createComponent('/sessions/update/5');
    });

    it('should fetch the session and prefill the form', () => {
      const session = buildSession({ id: 5, name: 'Yoga session', users: [7, 8] });
      const sessionReq = httpTestingController.expectOne(`${sessionPath}/5`);
      expect(sessionReq.request.method).toBe('GET');
      sessionReq.flush(session);
      fixture.detectChanges();

      flushTeachers();

      expect(component.onUpdate).toBe(true);
      expect(getNameInput().value).toBe('Yoga session');
      expect(getDateInput().value).toBe('2023-06-01');
    });

    it('should update the session, keep existing participants and navigate to sessions on submit', () => {
      const session = buildSession({ id: 5, name: 'Yoga session', users: [7, 8] });
      const sessionReq = httpTestingController.expectOne(`${sessionPath}/5`);
      sessionReq.flush(session);
      fixture.detectChanges();
      flushTeachers();

      const navigateSpy = jest.spyOn(router, 'navigate');
      setInputValue(getNameInput(), 'Yoga session updated');

      getSubmitButton()?.click();
      fixture.detectChanges();

      const updateReq = httpTestingController.expectOne(`${sessionPath}/5`);
      expect(updateReq.request.method).toBe('PUT');
      expect(updateReq.request.body).toEqual({
        name: 'Yoga session updated',
        date: new Date('2023-06-01'),
        teacher_id: 1,
        description: 'A relaxing yoga session',
        users: [7, 8]
      });
      updateReq.flush(session);

      expect(snackBarOpenSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('when the user is not admin', () => {
    it('should redirect to the sessions list', async () => {
      mockSessionService.sessionInformation = { admin: false, id: 1 };
      await configureTestBed();

      let navigateSpy: jest.SpiedFunction<Router['navigate']> | undefined;
      createComponent('/sessions/create', () => {
        navigateSpy = jest.spyOn(router, 'navigate');
      });

      expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);

      flushTeachers();
    });
  });
});
