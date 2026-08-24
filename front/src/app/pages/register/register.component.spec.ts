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
import { environment } from 'src/environments/environment';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  const pathService = `${environment.baseUrl}/auth`;

  const getFirstNameInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="first-name-input"]');
  const getLastNameInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="last-name-input"]');
  const getEmailInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="email-input"]');
  const getPasswordInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[data-testid="password-input"]');
  const getSubmitButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('[data-testid="submit-button"]');
  const getErrorMessage = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="register-error-message"]');

  const writeFieldValue = (input: HTMLInputElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };

  const setInputValue = (input: HTMLInputElement, value: string): void => {
    writeFieldValue(input, value);
    fixture.detectChanges();
  };

  const fillValidForm = (): void => {
    writeFieldValue(getFirstNameInput(), 'John');
    writeFieldValue(getLastNameInput(), 'Doe');
    writeFieldValue(getEmailInput(), 'john.doe@example.com');
    writeFieldValue(getPasswordInput(), 'password123');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
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
      fillValidForm();
      setInputValue(getEmailInput(), 'not-an-email');

      expect(component.form.invalid).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should be invalid when the first name is shorter than 3 characters', () => {
      fillValidForm();
      setInputValue(getFirstNameInput(), 'Jo');

      expect(component.form.invalid).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should be invalid when the last name is longer than 20 characters', () => {
      fillValidForm();
      setInputValue(getLastNameInput(), 'A'.repeat(21));

      expect(component.form.invalid).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should be invalid when the password is shorter than 3 characters', () => {
      fillValidForm();
      setInputValue(getPasswordInput(), 'ab');

      expect(component.form.invalid).toBe(true);
      expect(getSubmitButton().disabled).toBe(true);
    });

    it('should be valid and the submit button enabled when all fields are valid', () => {
      fillValidForm();

      expect(component.form.valid).toBe(true);
      expect(getSubmitButton().disabled).toBe(false);
    });
  });

  describe('submit', () => {
    it('should not send any request when the submit button is clicked while the form is invalid', () => {
      getSubmitButton().click();
      fixture.detectChanges();

      httpTestingController.expectNone(`${pathService}/register`);
    });

    it('should send a register request with the form value when a valid form is submitted', () => {
      fillValidForm();

      getSubmitButton().click();
      fixture.detectChanges();

      const req = httpTestingController.expectOne(`${pathService}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      });

      req.flush(null);
    });

    it('should navigate to /login on a successful registration', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      fillValidForm();
      getSubmitButton().click();
      fixture.detectChanges();

      const req = httpTestingController.expectOne(`${pathService}/register`);
      req.flush(null);

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(component.onError).toBe(false);
    });

    it('should display an error message and not navigate when the registration request fails', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      fillValidForm();
      getSubmitButton().click();
      fixture.detectChanges();

      const req = httpTestingController.expectOne(`${pathService}/register`);
      req.flush('Email already used', { status: 400, statusText: 'Bad Request' });
      fixture.detectChanges();

      expect(component.onError).toBe(true);
      expect(navigateSpy).not.toHaveBeenCalled();

      const errorMessage = getErrorMessage();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toContain('An error occurred');
    });

    it('should not display an error message before any submission', () => {
      expect(getErrorMessage()).toBeNull();
    });
  });
});
