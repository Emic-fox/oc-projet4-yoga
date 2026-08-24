import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { User } from 'src/app/core/models/user.interface';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { MeComponent } from './me.component';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let httpTestingController: HttpTestingController;
  let router: Router;
  let snackBarOpenSpy: jest.SpiedFunction<MatSnackBar['open']>;

  const pathService = `${environment.baseUrl}/user`;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    },
    logOut: jest.fn()
  };

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: true,
    password: 'password123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-06-01'),
    ...overrides
  });

  const getUserName = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="user-name"]');
  const getUserEmail = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="user-email"]');
  const getAdminMessage = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="admin-message"]');
  const getDeleteButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-testid="delete-account-button"] button');
  const getCreatedAt = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="created-at"]');
  const getUpdatedAt = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="updated-at"]');

  beforeEach(async () => {
    mockSessionService.sessionInformation = { admin: true, id: 1 };
    mockSessionService.logOut.mockClear();
    snackBarOpenSpy = jest.spyOn(MatSnackBar.prototype, 'open').mockReturnValue({} as ReturnType<MatSnackBar['open']>);

    await TestBed.configureTestingModule({
      imports: [
        MeComponent,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    snackBarOpenSpy.mockRestore();
  });

  const flushUser = (user: User): void => {
    const req = httpTestingController.expectOne(`${pathService}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(user);
    fixture.detectChanges();
  };

  it('should create', () => {
    flushUser(buildUser());
    expect(component).toBeTruthy();
  });

  it('should fetch the current user by the session user id', () => {
    flushUser(buildUser());
  });

  it('should display the user name and email once loaded', () => {
    flushUser(buildUser({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }));

    expect(getUserName()?.textContent).toContain('John');
    expect(getUserName()?.textContent).toContain('DOE');
    expect(getUserEmail()?.textContent).toContain('john.doe@example.com');
  });

  it('should display the record dates once loaded', () => {
    flushUser(buildUser());

    expect(getCreatedAt()).toBeTruthy();
    expect(getUpdatedAt()).toBeTruthy();
  });

  describe('when the user is admin', () => {
    it('should display the admin message and not the delete button', () => {
      flushUser(buildUser({ admin: true }));

      expect(getAdminMessage()).toBeTruthy();
      expect(getAdminMessage()?.textContent).toContain('You are admin');
      expect(getDeleteButton()).toBeNull();
    });
  });

  describe('when the user is not admin', () => {
    it('should display the delete button and not the admin message', () => {
      flushUser(buildUser({ admin: false }));

      expect(getAdminMessage()).toBeNull();
      expect(getDeleteButton()).toBeTruthy();
    });

    it('should delete the account, notify, log out and navigate home when the delete button is clicked', () => {
      flushUser(buildUser({ admin: false }));

      const navigateSpy = jest.spyOn(router, 'navigate');

      getDeleteButton()?.click();
      fixture.detectChanges();

      const deleteReq = httpTestingController.expectOne(`${pathService}/1`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      expect(snackBarOpenSpy).toHaveBeenCalledWith('Your account has been deleted !', 'Close', { duration: 3000 });
      expect(mockSessionService.logOut).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
