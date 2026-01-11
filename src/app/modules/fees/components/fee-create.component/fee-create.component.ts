import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { FeeService } from '../../services/fee.service';
import { FeeCreateRequest } from '../../models/fee.types';
import { StudentService } from '../../../student/services/student.service';
import { Student } from '../../../student/models/student';


@Component({
  selector: 'app-fee-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './fee-create.component.html',
  styleUrls: ['./fee-create.component.css']
})
export class FeeCreateComponent implements OnInit {
  feeForm: FormGroup;

  // Search State
  searchKeyword: string = '';
  isSearching = false;
  searchResults: Student[] = [];
  showResults = false;

  // Form Submission State
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private studentService: StudentService
  ) {
    this.feeForm = this.fb.group({
      studentId: ['', Validators.required],
      academicYear: ['2025-2026', Validators.required],
      feeItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.addFeeItem();
  }

  // --- SEARCH LOGIC ---
  onSearch() {
    if (!this.searchKeyword.trim()) return;

    this.isSearching = true;
    this.showResults = true;

    // Construct the filter exactly as your Java DTO expects
    const filter = {
      keyword: this.searchKeyword,
      page: 0,
      size: 5,            // We only need top 5 matches for a quick picker
      sortBy: 'firstName',
      direction: 'ASC' as const // Explicit casting for TS
    };

    this.studentService.search(filter).subscribe({
      next: (response: any) => {
        // Assuming response is Page<Student>, so the list is in response.content
        this.searchResults = response.content || [];
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Search failed', err);
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  selectStudent(student: Student) {
    // 1. Auto-fill the form ID
    this.feeForm.patchValue({
      studentId: student.id // Ensure this matches your backend property (e.g., admissionNo)
    });

    // 2. Clear search UI to keep it clean
    this.showResults = false;
    this.searchKeyword = '';
    this.searchResults = [];
  }

  closeSearch() {
    this.showResults = false;
  }

  // --- EXISTING FORM LOGIC ---
  get feeItems(): FormArray {
    return this.feeForm.get('feeItems') as FormArray;
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

  onSubmit() {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: FeeCreateRequest = this.feeForm.value;

    this.feeService.createFee(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Fee structure created successfully!';
        this.feeForm.reset();
        this.feeItems.clear();
        this.addFeeItem();
        this.feeForm.patchValue({ academicYear: '2025-2026' });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to create fee. Please check details.';
      }
    });
  }
}