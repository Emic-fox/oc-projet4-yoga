import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { expect } from '@jest/globals';

import { UnauthGuard } from './unauth.guard';
import { SessionService } from '../services/session.service';

describe('UnauthGuard', () => {
  let guard: UnauthGuard;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([])
      ]
    });
    guard = TestBed.inject(UnauthGuard);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when the user is not logged in', () => {
    sessionService.isLogged = false;
    const navigateSpy = jest.spyOn(router, 'navigate');

    expect(guard.canActivate()).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should deny activation and redirect to /sessions when the user is logged in', () => {
    sessionService.isLogged = true;
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    expect(guard.canActivate()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});
