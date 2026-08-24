import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { expect, jest } from '@jest/globals';

import { NavLinkComponent } from './nav-link.component';

@Component({
  standalone: true,
  imports: [ NavLinkComponent ],
  template: `<app-nav-link [link]="link" (linkClick)="onLinkClick()">Home</app-nav-link>`
})
class TestHostComponent {
  link?: string | unknown[];
  onLinkClick(): void {}
}

describe('NavLinkComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TestHostComponent ],
      providers: [ provideRouter([]) ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(host).toBeTruthy();
  });

  it('should render an anchor with the routerLink and project its content when link is provided', () => {
    host.link = '/sessions';
    fixture.detectChanges();

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');

    expect(anchor).toBeTruthy();
    expect(anchor.textContent).toContain('Home');
    expect(button).toBeNull();
  });

  it('should render a button and project its content when no link is provided', () => {
    fixture.detectChanges();

    const anchor: HTMLAnchorElement | null = fixture.nativeElement.querySelector('a');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Home');
    expect(anchor).toBeNull();
  });

  it('should emit linkClick when the button is clicked and no link is provided', () => {
    const onLinkClickSpy = jest.spyOn(host, 'onLinkClick');
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(onLinkClickSpy).toHaveBeenCalledTimes(1);
  });

  it('should not emit linkClick when link is provided', () => {
    host.link = '/sessions';
    const onLinkClickSpy = jest.spyOn(host, 'onLinkClick');
    fixture.detectChanges();

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    anchor.click();

    expect(onLinkClickSpy).not.toHaveBeenCalled();
  });
});
