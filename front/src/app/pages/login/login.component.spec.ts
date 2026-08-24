import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { SessionInformation } from 'src/app/core/models/session-information.interface';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const pathService = `${environment.baseUrl}/auth`;

  const sessionInformation: SessionInformation = {
    token: 'token',
    type: 'Bearer',
    id: 1,
    username: 'JohnDoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: false
  };

  const getEmailInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="email-input"]');
  const getPasswordInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="password-input"]');
  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('[data-testid="submit-button"]');
  const getToggleVisibilityButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('[data-testid="toggle-password-visibility-button"]');
  const getErrorMessage = (): HTMLParagraphElement | null =>
    fixture.nativeElement.querySelector('[data-testid="login-error-message"]');

  const writeFieldValue = (input: HTMLInputElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  const setInputValue = (input: HTMLInputElement, value: string): void => {
    writeFieldValue(input, value);
    fixture.detectChanges();
  };

  const fillValidForm = (): void => {
    writeFieldValue(getEmailInput(), 'john.doe@example.com');
    writeFieldValue(getPasswordInput(), 'password123');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      providers: [
        SessionService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ],
      imports: [
        LoginComponent,
        BrowserAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule]
    })
      .compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should be invalid and the submit button disabled when the form is empty', () => {
      expect(component.form.invalid).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should be invalid when the email is not a valid email address', () => {
      setInputValue(getEmailInput(), 'not-an-email');
      setInputValue(getPasswordInput(), 'password123');

      expect(component.form.invalid).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should be invalid when the password is shorter than 3 characters', () => {
      setInputValue(getEmailInput(), 'john.doe@example.com');
      setInputValue(getPasswordInput(), 'ab');

      expect(component.form.invalid).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should be valid and the submit button enabled when email and password are valid', () => {
      fillValidForm();

      expect(component.form.valid).toBe(true);
      expect(getSubmitButton().disabled).toBe(false);
    });
  });

  describe('password visibility toggle', () => {
    it('should hide the password by default', () => {
      expect(component.hide).toBe(true);
      expect(getPasswordInput().type).toBe('password');
    });

    it('should reveal the password when the visibility button is clicked', () => {
      getToggleVisibilityButton().click();
      fixture.detectChanges();

      expect(component.hide).toBe(false);
      expect(getPasswordInput().type).toBe('text');
    });

    it('should hide the password again when the visibility button is clicked twice', () => {
      getToggleVisibilityButton().click();
      fixture.detectChanges();
      getToggleVisibilityButton().click();
      fixture.detectChanges();

      expect(component.hide).toBe(true);
      expect(getPasswordInput().type).toBe('password');
    });
  });

  describe('submit', () => {
    it('should not send any request when the submit button is clicked while the form is invalid', () => {
      getSubmitButton().click();
      fixture.detectChanges();

      httpTestingController.expectNone(`${pathService}/login`);
    });

    it('should send a login request with the form value when a valid form is submitted', () => {
      fillValidForm();

      getSubmitButton().click();
      fixture.detectChanges();

      const req = httpTestingController.expectOne(`${pathService}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'john.doe@example.com',
        password: 'password123'
      });

      req.flush(sessionInformation);
    });

    it('should log the user in and navigate to /sessions on a successful login', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      fillValidForm();
      getSubmitButton().click();
      fixture.detectChanges();

      const req = httpTestingController.expectOne(`${pathService}/login`);
      req.flush(sessionInformation);

      expect(sessionService.isLogged).toBe(true);
      expect(sessionService.sessionInformation).toEqual(sessionInformation);
      expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
      expect(component.onError).toBe(false);
    });

    it('should display an error message and not navigate when the login request fails', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      fillValidForm();
      getSubmitButton().click();
      fixture.detectChanges();

      const req = httpTestingController.expectOne(`${pathService}/login`);
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
      fixture.detectChanges();

      expect(component.onError).toBe(true);
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(sessionService.isLogged).toBe(false);

      const errorMessage = getErrorMessage();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toContain('An error occurred');
    });

    it('should not display an error message before any submission', () => {
      expect(getErrorMessage()).toBeNull();
    });
  });
});
