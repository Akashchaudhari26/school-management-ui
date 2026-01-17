import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMarkSheetComponent } from './view-mark-sheet.component';

describe('ViewMarkSheetComponent', () => {
  let component: ViewMarkSheetComponent;
  let fixture: ComponentFixture<ViewMarkSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMarkSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMarkSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
