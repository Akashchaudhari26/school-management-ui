import { Component, OnInit } from '@angular/core';
import { FeeResponse } from '../../models/fee.types';
import { FeeService } from '../../services/fee.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fee-due',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fee-due.component.html',
  styleUrls: ['./fee-due.component.css']
})
export class FeeDuesComponent implements OnInit {

  // State
  academicYear: string = '2025-2026';
  allDues: FeeResponse[] = [];      // The raw data from API
  filteredDues: FeeResponse[] = []; // The data shown in table
  isLoading = false;
  errorMessage = '';

  // Filters
  filterName = '';
  filterClass = '';

  // Statistics
  totalPendingAmount = 0;
  totalDefaulters = 0;

  constructor(
    private feeService: FeeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchDues();
  }

  fetchDues() {
    this.isLoading = true;
    this.errorMessage = '';

    this.feeService.getPendingDues(this.academicYear).subscribe({
      next: (data) => {
        this.allDues = data;
        this.applyFilters(); // Calculate stats and list initially
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load dues list. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // --- FILTERING LOGIC ---
  applyFilters() {
    this.filteredDues = this.allDues.filter(student => {
      // 1. Filter by Name/ID
      const matchName = !this.filterName ||
        student.studentName.toLowerCase().includes(this.filterName.toLowerCase()) ||
        student.studentId.toLowerCase().includes(this.filterName.toLowerCase());

      // 2. Filter by Class (Exact match if selected)
      const matchClass = !this.filterClass ||
        student.currentClassId === this.filterClass;

      return matchName && matchClass;
    });

    this.calculateStats();
  }

  calculateStats() {
    this.totalDefaulters = this.filteredDues.length;
    this.totalPendingAmount = this.filteredDues.reduce((sum, item) => sum + item.dueAmount, 0);
  }

  // Navigation to Collect Page
  // Note: This assumes you might add queryParam logic to 'collect' page later, 
  // or just copy the ID manually.
  collectFrom(studentFeeResponse: FeeResponse) {
    this.router.navigate(['/dashboard/fees/collect'], {
      // We still pass queryParam as a fallback (good for bookmarking/refreshing)
      queryParams: { studentId: studentFeeResponse.studentId },

      // THE OPTIMIZATION: Pass the actual object in memory
      state: { feeData: studentFeeResponse }
    });
  }
}