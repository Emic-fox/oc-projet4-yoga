import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { expect, jest } from '@jest/globals';

import { IconButtonComponent } from './icon-button.component';

describe('IconButtonComponent', () => {
  let component: IconButtonComponent;
  let fixture: ComponentFixture<IconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ IconButtonComponent ],
      providers: [ provideRouter([]) ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconButtonComponent);
    component = fixture.componentInstance;
    component.icon = 'delete';
    component.label = 'Delete';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the icon and the label', () => {
    const icon: HTMLElement = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent?.trim()).toBe('delete');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('Delete');
  });

  it('should default color to primary', () => {
    expect(component.color).toBe('primary');
  });

  it('should emit buttonClick when no routerLink is provided and the button is clicked', () => {
    const buttonClickSpy = jest.fn();
    component.buttonClick.subscribe(buttonClickSpy);

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(buttonClickSpy).toHaveBeenCalledTimes(1);
  });

  it('should not emit buttonClick and should navigate when routerLink is provided and the button is clicked', () => {
    component.routerLink = '/sessions';
    fixture.detectChanges();

    const buttonClickSpy = jest.fn();
    component.buttonClick.subscribe(buttonClickSpy);

    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigateByUrl');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(buttonClickSpy).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalled();
    expect(navigateSpy.mock.calls[0][0].toString()).toBe('/sessions');
  });
});
