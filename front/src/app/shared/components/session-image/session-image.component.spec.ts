import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionImageComponent } from './session-image.component';

describe('SessionImageComponent', () => {
  let component: SessionImageComponent;
  let fixture: ComponentFixture<SessionImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SessionImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionImageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the session image', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('/assets/sessions.png');
    expect(img.alt).toBe('Yoga session');
  });
});
