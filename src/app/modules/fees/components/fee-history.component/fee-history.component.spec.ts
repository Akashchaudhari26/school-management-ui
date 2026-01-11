import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeHistoryComponent } from './fee-history.component';

describe('FeeHistoryComponent', () => {
  let component: FeeHistoryComponent;
  let fixture: ComponentFixture<FeeHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
