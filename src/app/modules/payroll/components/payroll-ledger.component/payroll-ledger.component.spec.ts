import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollLedgerComponent } from './payroll-ledger.component';

describe('PayrollLedgerComponent', () => {
  let component: PayrollLedgerComponent;
  let fixture: ComponentFixture<PayrollLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollLedgerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
