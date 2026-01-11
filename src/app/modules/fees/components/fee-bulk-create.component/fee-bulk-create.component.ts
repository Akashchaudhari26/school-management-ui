import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeeService } from '../../services/fee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fee-bulk-create.component',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './fee-bulk-create.component.html',
  styleUrl: './fee-bulk-create.component.css',
})
export class FeeBulkCreateComponent {
  bulkForm: FormGroup;
  isSubmitting = false;

  // Response State
  responseSummary: any = null; // Stores { totalStudentsFound, successfullyCreated, skippedAlreadyExists }
  errorMessage = '';

  // Dropdown Data (You can fetch these from a ClassService if you have one)
  classes = ['NURSERY', 'LKG', 'UKG', 'CLASS_1', 'CLASS_2'];
  sections = ['A', 'B', 'C', 'D'];

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private router: Router
  ) {
    this.bulkForm = this.fb.group({
      classId: ['', Validators.required],
      section: [''], // Optional
      academicYear: ['2025-2026', Validators.required],
      feeItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.addFeeItem(); // Start with one empty row
  }

  // --- Dynamic Fee Items Logic ---
  get feeItems(): FormArray {
    return this.bulkForm.get('feeItems') as FormArray;
  }

  newFeeItem(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addFeeItem() {
    this.feeItems.push(this.newFeeItem());
  }

  removeFeeItem(index: number) {
    if (this.feeItems.length > 1) {
      this.feeItems.removeAt(index);
    } else {
      alert("At least one fee item is required.");
    }
  }

  getTotalAmount(): number {
    return this.feeItems.controls
      .map(control => control.get('amount')?.value || 0)
      .reduce((acc, value) => acc + value, 0);
  }

  // --- Submit Logic ---
  onSubmit() {
    if (this.bulkForm.invalid) {
      this.bulkForm.markAllAsTouched();
      return;
    }

    if (!confirm(`Are you sure you want to apply this fee structure to ALL students in ${this.bulkForm.value.classId}?`)) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.responseSummary = null;

    this.feeService.createBulkFees(this.bulkForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.responseSummary = res; // Show the summary report
        // We do NOT reset the form immediately so user can see what they just applied
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.errorMessage = 'Bulk creation failed. Please check server logs.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/fees/dues']);
  }
}
