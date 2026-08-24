import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { BehaviorSubject } from 'rxjs';
import { SessionService } from '../../../core/services/session.service';

import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
  let fixture: ComponentFixture<NavBarComponent>;
  let component: NavBarComponent;
  let router: Router;
  let isLoggedSubject: BehaviorSubject<boolean>;

  const mockSessionService = {
    $isLogged: () => isLoggedSubject.asObservable(),
    logOut: jest.fn()
  };

  const getTitle = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="app-title"]');
  const getSessionsLink = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="sessions-link"]');
  const getAccountLink = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="account-link"]');
  const getLogoutButton = (): HTMLButtonElement | null =>
    fixture.nativeElement.querySelector('[data-testid="logout-link"] button');
  const getLoginLink = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="login-link"]');
  const getRegisterLink = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="register-link"]');

  beforeEach(async () => {
    isLoggedSubject = new BehaviorSubject<boolean>(false);
    mockSessionService.logOut.mockClear();

    await TestBed.configureTestingModule({
      imports: [NavBarComponent, MatToolbarModule],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the app title', () => {
    fixture.detectChanges();
    expect(getTitle()?.textContent).toContain('Yoga app');
  });

  describe('when the user is logged out', () => {
    it('should display the login and register links but not the sessions, account and logout links', () => {
      fixture.detectChanges();

      expect(getLoginLink()).toBeTruthy();
      expect(getRegisterLink()).toBeTruthy();
      expect(getSessionsLink()).toBeNull();
      expect(getAccountLink()).toBeNull();
      expect(getLogoutButton()).toBeNull();
    });
  });

  describe('when the user is logged in', () => {
    beforeEach(() => {
      isLoggedSubject.next(true);
      fixture.detectChanges();
    });

    it('should display the sessions, account and logout links but not the login and register links', () => {
      expect(getSessionsLink()).toBeTruthy();
      expect(getAccountLink()).toBeTruthy();
      expect(getLogoutButton()).toBeTruthy();
      expect(getLoginLink()).toBeNull();
      expect(getRegisterLink()).toBeNull();
    });

    it('should log the user out and navigate home when the logout link is clicked', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      getLogoutButton()?.click();
      fixture.detectChanges();

      expect(mockSessionService.logOut).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['']);
    });
  });
});
