import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeePayment, FeeResponse } from '../../models/fee.types';
import { FeeService } from '../../services/fee.service';
import { StudentService } from '../../../student/services/student.service';
import { Student } from '../../../student/models/student';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';
import { AcademicYear } from '../../../school-config/models/school-config';

@Component({
  selector: 'app-fee-history.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './fee-history.component.html',
  styleUrl: './fee-history.component.css',
})
export class FeeHistoryComponent implements OnInit {

  // --- Search State ---
  searchKeyword = '';
  isSearching = false;
  showResults = false;
  searchResults: Student[] = [];

  // --- Data State ---
  selectedStudent: Student | undefined; // Stores basic student info (Name, Class)
  history: FeePayment[] = [];

  // We also fetch the Summary to show "Total vs Paid" overview at the top
  feeSummary: FeeResponse | null = null;

  academicYear: string = '';
  academicYears: AcademicYear[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private feeService: FeeService,
    private studentService: StudentService,
    private configService: SchoolConfigService
  ) { }

  ngOnInit(): void {
    this.loadAcademicYears();
  }

  // --- 1. SEARCH STUDENT ---
  onSearch() {
    if (!this.searchKeyword.trim()) return;
    this.isSearching = true;
    this.showResults = true;
    this.errorMessage = '';

    const filter = {
      keyword: this.searchKeyword,
      page: 0, size: 5, sortBy: 'firstName', direction: 'ASC' as const
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

  // --- 2. SELECT & FETCH ---
  selectStudent(student: any) {
    this.selectedStudent = student;
    this.showResults = false;
    this.searchKeyword = '';

    this.fetchData(student.id);
  }

  fetchData(studentId: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.history = [];
    this.feeSummary = null;

    this.feeService.getFeeDetails(studentId, this.academicYear).subscribe({
      next: (data) => {
        this.feeSummary = data;
        this.history = data.payments;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  // --- 3. DOWNLOAD RECEIPT ---
  downloadReceipt(receiptNo: string) {
    this.feeService.downloadReceipt(receiptNo).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${receiptNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Download failed.')
    });
  }

  closeSearch() { this.showResults = false; }

  loadAcademicYears() {
    this.configService.getAllAcademicYears().subscribe(years => {
      this.academicYears = years;
    });
  }
}