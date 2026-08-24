import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';

import { PageTitleComponent } from './page-title.component';

describe('PageTitleComponent', () => {
  let component: PageTitleComponent;
  let fixture: ComponentFixture<PageTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PageTitleComponent ],
      providers: [ provideRouter([]) ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTitleComponent);
    component = fixture.componentInstance;
    component.title = 'Sessions';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const h1: HTMLHeadingElement = fixture.nativeElement.querySelector('[data-testid="page-title"]');
    expect(h1.textContent).toContain('Sessions');
  });

  it('should call window.history.back when no backRouterLink is provided and the button is clicked', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="back-button"]');
    button.click();

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('should not call window.history.back when a backRouterLink is provided', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.backRouterLink = '/sessions';
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="back-button"]');
    button.click();

    expect(backSpy).not.toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('should navigate to backRouterLink when the button is clicked', () => {
    component.backRouterLink = '/sessions';
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigateByUrl');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="back-button"]');
    button.click();

    expect(navigateSpy).toHaveBeenCalled();
    expect(navigateSpy.mock.calls[0][0].toString()).toBe('/sessions');
  });
});
