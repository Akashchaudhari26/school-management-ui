import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FeePaymentRequest, FeeResponse } from '../../models/fee.types';
import { FeeService } from '../../services/fee.service';
import { StudentService } from '../../../student/services/student.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Student } from '../../../student/models/student';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';
import { AcademicYear } from '../../../school-config/models/school-config';

@Component({
  selector: 'app-fee-collect',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './fee-collect.component.html',
  styleUrls: ['./fee-collect.component.css'] // Only for branding variables
})
export class FeeCollectComponent {

  // --- Search State ---
  searchKeyword = '';
  isSearching = false;
  searchResults: Student[] = [];
  showResults = false;

  // --- Fee Data State ---
  feeSummary: FeeResponse | null = null;
  academicYear = '';
  isLoadingSummary = false;
  academicYears: AcademicYear[] = [];

  // --- Payment Form ---
  paymentForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  collectedBy: string;


  constructor(
    private fb: FormBuilder,
    private feeService: FeeService,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private configService: SchoolConfigService

  ) {
    const userStr = localStorage.getItem('user');
    this.collectedBy = userStr ? JSON.parse(userStr).fullName : '';

    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      mode: ['CASH', Validators.required],
      collectedBy: [this.collectedBy, Validators.required] // Hardcoded for now, or get from Auth
    });
  }
  ngOnInit(): void {
    // 1. Check for State Transfer (Optimization)
    const navigationState = history.state;

    if (navigationState && navigationState.feeData) {
      console.log('Using pre-fetched data from Dashboard');
      this.loadFromState(navigationState.feeData);
    }
    // 2. Fallback: Check Query Params (If page refreshed or direct link)
    else {
      this.route.queryParams.subscribe(params => {
        if (params['studentId']) {
          this.searchKeyword = params['studentId'];
          this.onSearch(); // Triggers API call
        }
      });
    }
    this.loadAcademicYears();

  }
  loadFromState(data: FeeResponse) {
    this.feeSummary = data;
    // Auto-fill the payment form amount
    this.paymentForm.patchValue({
      amount: data.dueAmount > 0 ? data.dueAmount : null
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/fees/dues']);
  }
  // 1. SEARCH STUDENT
  onSearch() {
    if (!this.searchKeyword.trim()) return;
    this.isSearching = true;
    this.showResults = true;

    const filter = {
      keyword: this.searchKeyword,
      page: 0,
      size: 5,
      sortBy: 'firstName',
      direction: 'ASC' as const
    };

    this.studentService.search(filter).subscribe({
      next: (res: any) => {
        this.searchResults = res.content || [];
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }
  // 2. SELECT STUDENT & FETCH FEES
  selectStudent(student: any) {
    this.showResults = false;
    this.searchKeyword = ''; // Clear search bar
    this.fetchFeeSummary(student.id);
  }

  fetchFeeSummary(studentId: string) {
    this.isLoadingSummary = true;
    this.feeSummary = null;
    this.successMessage = '';
    this.errorMessage = '';

    this.feeService.getFeeDetails(studentId, this.academicYear).subscribe({
      next: (data) => {
        this.feeSummary = data;
        this.isLoadingSummary = false;
        // Auto-fill amount with pending dues for convenience
        this.paymentForm.patchValue({ amount: data.dueAmount });
      },
      error: (err) => {
        this.isLoadingSummary = false;
        this.errorMessage = 'No Fee Structure found for this student. Please create one first.';
      }
    });
  }
  // 3. SUBMIT PAYMENT
  onPay() {
    if (this.paymentForm.invalid || !this.feeSummary) return;

    this.isSubmitting = true;
    const request: FeePaymentRequest = this.paymentForm.value;

    this.feeService.payFee(this.feeSummary.studentId, this.academicYear, request).subscribe({
      next: (updatedFeeResponse) => {
        this.isSubmitting = false;
        this.successMessage = 'Payment Collected Successfully!';
        this.feeSummary = updatedFeeResponse; // Update the summary UI instantly
        this.paymentForm.reset({ mode: 'CASH', collectedBy: this.collectedBy }); // Reset form
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Payment Failed. Server Error.';
      }
    });
  }

  closeSearch() {
    this.showResults = false;
  }

  loadAcademicYears() {
    // Fetch all years so the admin can select a past year if needed
    this.configService.getAllAcademicYears().subscribe(years => {
      this.academicYears = years;

      // 4. Find the ACTIVE year and set it as default
      const activeYear = years.find(y => y.active); // Assuming 'active' is the boolean flag
      if (activeYear) {
        this.paymentForm.patchValue({ academicYear: activeYear.name });
      }
    });
  }
}