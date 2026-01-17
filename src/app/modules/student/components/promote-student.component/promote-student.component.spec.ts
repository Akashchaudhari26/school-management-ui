import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoteStudentComponent } from './promote-student.component';

describe('PromoteStudentComponent', () => {
  let component: PromoteStudentComponent;
  let fixture: ComponentFixture<PromoteStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoteStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoteStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
