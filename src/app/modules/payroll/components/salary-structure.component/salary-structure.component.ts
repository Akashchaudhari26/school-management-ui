import { Component, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from '../../services/payroll.service';
import { Staff, StaffSearchFilter } from '../../../staff/models/staff';
import { StaffService } from '../../../staff/services/staff.service';

@Component({
  selector: 'app-salary-structure.component',
  imports: [COMMON_IMPORTS],
  templateUrl: './salary-structure.component.html',
  styleUrl: './salary-structure.component.css',
})
export class SalaryStructureComponent implements OnInit {
  salaryForm: FormGroup;

  // Data State
  originalStaffList: Staff[] = []; // Store full list here
  filteredStaffList: Staff[] = []; // Show this in the table
  searchQuery: string = '';        // Bound to the search input

  selectedStaff: Staff | null = null;
  isModalOpen = false;
  isLoading = false;

  calculatedNet = 0;
  calculatedGross = 0;

  constructor(
    private fb: FormBuilder,
    private payrollService: PayrollService,
    private staffService: StaffService
  ) {
    this.salaryForm = this.fb.group({
      id: [null],
      staffId: ['', Validators.required],
      staffName: [''],
      basicSalary: [0, [Validators.required, Validators.min(0)]],
      hra: [0],
      da: [0],
      transportAllowance: [0],
      specialAllowance: [0],
      providentFund: [0],
      professionalTax: [0]
    });
  }

  ngOnInit(): void {
    this.loadStaffList();
    this.salaryForm.valueChanges.subscribe(val => this.calculatePreview(val));
  }

  loadStaffList() {
    this.isLoading = true;
    const filter: StaffSearchFilter = {
      page: 0,
      size: 100,
      sortBy: 'firstName',
      direction: 'ASC',
      status: 'ACTIVE'
    };

    this.staffService.search(filter).subscribe({
      next: (res) => {
        this.originalStaffList = res.content;
        this.filteredStaffList = res.content; // Initialize filtered list
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // --- New Search Function ---
  onSearch(query: string) {
    this.searchQuery = query.toLowerCase();
    if (!this.searchQuery) {
      this.filteredStaffList = this.originalStaffList;
    } else {
      this.filteredStaffList = this.originalStaffList.filter(s =>
        s.fullName.toLowerCase().includes(this.searchQuery) ||
        s.mobile?.includes(this.searchQuery)
      );
    }
  }

  openSalaryModal(staff: Staff) {
    this.selectedStaff = staff;
    this.isModalOpen = true;

    // Reset form
    this.salaryForm.reset({
      staffId: staff.employeeCode,
      staffName: staff.fullName,
      basicSalary: 0, hra: 0, da: 0, transportAllowance: 0, specialAllowance: 0,
      providentFund: 0, professionalTax: 0
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedStaff = null;
  }

  calculatePreview(val: any) {
    const earnings = (val.basicSalary || 0) + (val.hra || 0) + (val.da || 0) +
      (val.transportAllowance || 0) + (val.specialAllowance || 0);
    const deductions = (val.providentFund || 0) + (val.professionalTax || 0);

    this.calculatedGross = earnings;
    this.calculatedNet = earnings - deductions;
  }

  onSubmit() {
    if (this.salaryForm.invalid) return;
    this.isLoading = true;
    this.payrollService.saveStructure(this.salaryForm.value).subscribe({
      next: () => {
        alert(`Salary saved for ${this.selectedStaff?.fullName}`);
        this.closeModal();
        this.isLoading = false;
      },
      error: () => {
        alert('Failed to save salary');
        this.isLoading = false;
      }
    });
  }
}