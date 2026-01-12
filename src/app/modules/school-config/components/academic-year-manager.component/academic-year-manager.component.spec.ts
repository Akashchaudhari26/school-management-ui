import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicYearManagerComponent } from './academic-year-manager.component';

describe('AcademicYearManagerComponent', () => {
  let component: AcademicYearManagerComponent;
  let fixture: ComponentFixture<AcademicYearManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicYearManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicYearManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
