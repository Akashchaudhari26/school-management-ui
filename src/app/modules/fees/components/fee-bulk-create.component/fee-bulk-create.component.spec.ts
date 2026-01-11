import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeBulkCreateComponent } from './fee-bulk-create.component';

describe('FeeBulkCreateComponent', () => {
  let component: FeeBulkCreateComponent;
  let fixture: ComponentFixture<FeeBulkCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeBulkCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeBulkCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
