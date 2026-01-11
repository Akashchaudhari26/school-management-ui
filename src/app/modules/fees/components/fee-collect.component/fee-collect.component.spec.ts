import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeCollectComponent } from './fee-collect.component';

describe('FeeCollectComponent', () => {
  let component: FeeCollectComponent;
  let fixture: ComponentFixture<FeeCollectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeCollectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeCollectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
