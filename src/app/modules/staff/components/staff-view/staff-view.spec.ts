import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffView } from './staff-view';

describe('StaffView', () => {
  let component: StaffView;
  let fixture: ComponentFixture<StaffView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
