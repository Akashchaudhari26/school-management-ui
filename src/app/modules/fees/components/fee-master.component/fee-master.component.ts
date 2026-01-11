import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeeService } from '../../services/fee.service';
import { DateUtils } from '../../../../core/utils/date.utils';

@Component({
  selector: 'app-fee-master.component',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './fee-master.component.html',
  styleUrl: './fee-master.component.css',
})

export class FeeMasterComponent implements OnInit {

  // State
  viewMode: 'LIST' | 'CREATE' | 'EDIT' = 'LIST'; // Added 'EDIT' mode
  academicYear!: string;
  academicYears: string[] = [];
  isLoading = false;
  masters: any[] = [];
  editingId: string | null = null; // Track which ID is being edited

  // Form
  masterForm: FormGroup;
  isSubmitting = false;

  classes = ['NURSERY', 'LKG', 'UKG', 'CLASS_1', 'CLASS_2', 'CLASS_3', 'CLASS_4', 'CLASS_5'];

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService
  ) {
    this.masterForm = this.fb.group({
      id: [null], // Hidden ID field for updates
      classId: ['', Validators.required],
      academicYear: [this.academicYear, Validators.required],
      feeItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.academicYears = DateUtils.generateAcademicYears(5); // last 5 years
    this.academicYear = DateUtils.getCurrentAcademicYear();
    this.fetchMasters();
  }

  fetchMasters() {
    this.isLoading = true;
    this.feeService.getFeeMasters(this.academicYear).subscribe({
      next: (data) => {
        this.masters = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // --- FORM HELPERS ---
  get feeItems(): FormArray {
    return this.masterForm.get('feeItems') as FormArray;
  }

  addFeeItem(name = '', amount = 0) {
    const item = this.fb.group({
      name: [name, Validators.required],
      amount: [amount, [Validators.required, Validators.min(0)]]
    });
    this.feeItems.push(item);
  }

  removeFeeItem(index: number) {
    this.feeItems.removeAt(index);
  }

  getTotalAmount(): number {
    return this.feeItems.controls
      .map(c => c.get('amount')?.value || 0)
      .reduce((a, b) => a + b, 0);
  }

  // --- ACTIONS ---
  switchToCreate() {
    this.viewMode = 'CREATE';
    this.editingId = null;
    this.masterForm.reset({ academicYear: this.academicYear });
    this.feeItems.clear();
    this.addFeeItem(); // Start with 1 empty row
  }

  editMaster(master: any) {
    this.viewMode = 'EDIT';
    this.editingId = master.id;

    // Populate Form
    this.masterForm.patchValue({
      id: master.id,
      classId: master.classId,
      academicYear: master.academicYear
    });

    // Populate Array
    this.feeItems.clear();
    master.feeItems.forEach((item: any) => {
      this.addFeeItem(item.name, item.amount);
    });
  }

  switchToList() {
    this.viewMode = 'LIST';
    this.editingId = null;
    this.fetchMasters();
  }

  onSubmit() {
    if (this.masterForm.invalid) return;

    this.isSubmitting = true;

    // Determine if we are creating or updating
    // For this implementation, we reuse the saveFeeMaster endpoint. 
    // If your backend distinguishes POST/PUT, add logic here.
    // Assuming 'saveFeeMaster' handles upsert based on ID presence.

    this.feeService.saveFeeMaster(this.masterForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert(this.editingId ? 'Fee Structure Updated!' : 'Fee Structure Created!');
        this.switchToList();
      },
      error: () => {
        this.isSubmitting = false;
        alert('Failed to save structure.');
      }
    });
  }

  expandedMasterIds: Set<string> = new Set();

  toggleExpand(id: string) {
    if (this.expandedMasterIds.has(id)) {
      this.expandedMasterIds.delete(id);
    } else {
      this.expandedMasterIds.add(id);
    }
  }

  isExpanded(id: string): boolean {
    return this.expandedMasterIds.has(id);
  }
}
