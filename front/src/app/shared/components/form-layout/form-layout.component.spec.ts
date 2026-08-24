import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { FormLayoutComponent } from './form-layout.component';

@Component({
  standalone: true,
  imports: [ FormLayoutComponent ],
  template: `
    <app-form-layout [maxWidth]="maxWidth" [title]="title">
      <span layout-title>Custom title</span>
      <p>Body content</p>
    </app-form-layout>
  `
})
class TestHostComponent {
  maxWidth: string | null = null;
  title?: string;
}

describe('FormLayoutComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TestHostComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(host).toBeTruthy();
  });

  it('should not set a max-width style when maxWidth is not provided', () => {
    fixture.detectChanges();
    const card: HTMLElement = fixture.nativeElement.querySelector('mat-card');
    expect(card.style.maxWidth).toBe('');
  });

  it('should apply maxWidth to the card style when provided', () => {
    host.maxWidth = '600px';
    fixture.detectChanges();

    const card: HTMLElement = fixture.nativeElement.querySelector('mat-card');
    expect(card.style.maxWidth).toBe('600px');
  });

  it('should display the title and hide the projected layout-title content when title is provided', () => {
    host.title = 'My Form';
    fixture.detectChanges();

    const cardTitle: HTMLElement = fixture.nativeElement.querySelector('mat-card-title');
    expect(cardTitle.textContent).toContain('My Form');
    expect(fixture.nativeElement.textContent).not.toContain('Custom title');
  });

  it('should project the layout-title content and not render mat-card-title when title is not provided', () => {
    fixture.detectChanges();

    const cardTitle: HTMLElement | null = fixture.nativeElement.querySelector('mat-card-title');
    expect(cardTitle).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Custom title');
  });

  it('should always project the default content into the card content', () => {
    fixture.detectChanges();
    const cardContent: HTMLElement = fixture.nativeElement.querySelector('mat-card-content');
    expect(cardContent.textContent).toContain('Body content');
  });
});
