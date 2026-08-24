import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { expect } from '@jest/globals';
import { Session } from 'src/app/core/models/session.interface';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import { ListComponent } from './list.component';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let httpTestingController: HttpTestingController;

  const pathService = `${environment.baseUrl}/session`;

  const mockSessionService = {
    sessionInformation: {
      admin: true
    }
  };

  const buildSession = (overrides: Partial<Session> = {}): Session => ({
    id: 1,
    name: 'Yoga session',
    description: 'A relaxing yoga session',
    date: new Date('2023-06-01'),
    teacher_id: 1,
    users: [],
    ...overrides
  });

  const flushSessions = (sessions: Session[]): void => {
    const req = httpTestingController.expectOne(pathService);
    expect(req.request.method).toBe('GET');
    req.flush(sessions);
    fixture.detectChanges();
  };

  const getCreateButton = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('[data-testid="create-session-button"]');
  const getSessionCards = (): NodeListOf<HTMLElement> =>
    fixture.nativeElement.querySelectorAll('[data-testid="session-card"]');
  const getEditButtons = (): NodeListOf<HTMLElement> =>
    fixture.nativeElement.querySelectorAll('[data-testid="edit-session-button"]');

  beforeEach(async () => {
    mockSessionService.sessionInformation = { admin: true };

    await TestBed.configureTestingModule({
      imports: [ListComponent, MatCardModule, MatIconModule],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    flushSessions([]);
    expect(component).toBeTruthy();
  });

  it('should fetch and display all sessions', () => {
    flushSessions([
      buildSession({ id: 1, name: 'Yoga session' }),
      buildSession({ id: 2, name: 'Cardio session' })
    ]);

    expect(getSessionCards().length).toBe(2);
  });

  it('should display an empty list when there are no sessions', () => {
    flushSessions([]);

    expect(getSessionCards().length).toBe(0);
  });

  describe('when the user is admin', () => {
    it('should display the create button and the edit button on each session', () => {
      flushSessions([buildSession()]);

      expect(getCreateButton()).toBeTruthy();
      expect(getEditButtons().length).toBe(1);
    });
  });

  describe('when the user is not admin', () => {
    it('should not display the create button nor the edit button', () => {
      httpTestingController.expectOne(pathService).flush([]);

      mockSessionService.sessionInformation = { admin: false };
      fixture = TestBed.createComponent(ListComponent);
      fixture.detectChanges();
      flushSessions([buildSession()]);

      expect(getCreateButton()).toBeNull();
      expect(getEditButtons().length).toBe(0);
    });
  });
});
