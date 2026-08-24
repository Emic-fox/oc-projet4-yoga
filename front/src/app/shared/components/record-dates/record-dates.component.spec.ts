import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { RecordDatesComponent } from './record-dates.component';

describe('RecordDatesComponent', () => {
  let component: RecordDatesComponent;
  let fixture: ComponentFixture<RecordDatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RecordDatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display nothing when no date is provided', () => {
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('should display only the created date when createdAt is provided', () => {
    component.createdAt = new Date(2024, 0, 15);
    fixture.detectChanges();

    const createdAt: HTMLDivElement = fixture.nativeElement.querySelector('[data-testid="created-at"]');
    expect(createdAt.textContent).toContain('Create at:');
    expect(createdAt.textContent).toContain('January 15, 2024');
    expect(fixture.nativeElement.querySelector('[data-testid="updated-at"]')).toBeNull();
  });

  it('should display only the updated date when updatedAt is provided', () => {
    component.updatedAt = new Date(2024, 5, 20);
    fixture.detectChanges();

    const updatedAt: HTMLDivElement = fixture.nativeElement.querySelector('[data-testid="updated-at"]');
    expect(updatedAt.textContent).toContain('Last update:');
    expect(updatedAt.textContent).toContain('June 20, 2024');
    expect(fixture.nativeElement.querySelector('[data-testid="created-at"]')).toBeNull();
  });

  it('should display both dates when both are provided', () => {
    component.createdAt = new Date(2024, 0, 15);
    component.updatedAt = new Date(2024, 5, 20);
    fixture.detectChanges();

    const createdAt: HTMLDivElement = fixture.nativeElement.querySelector('[data-testid="created-at"]');
    const updatedAt: HTMLDivElement = fixture.nativeElement.querySelector('[data-testid="updated-at"]');
    expect(createdAt.textContent).toContain('January 15, 2024');
    expect(updatedAt.textContent).toContain('June 20, 2024');
  });
});
