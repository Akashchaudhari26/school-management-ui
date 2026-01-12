import { Component } from '@angular/core';
import { AcademicYear } from '../../models/school-config';
import { SchoolConfigService } from '../../services/school-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-academic-year-manager.component',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './academic-year-manager.component.html',
  styleUrl: './academic-year-manager.component.css',
})
export class AcademicYearManagerComponent {
  activeYear: AcademicYear | null = null;
  allYears: AcademicYear[] = []; // <--- New Array for History
  isLoading = false;
  errorMessage = '';

  // Form Model
  newYear: AcademicYear = {
    name: '',       // e.g. "2025-2026"
    startDate: '',  // YYYY-MM-DD
    endDate: '',    // YYYY-MM-DD
    active: true    // Default to true because creating a new year usually means starting it
  };

  constructor(private configService: SchoolConfigService) { }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.isLoading = true;

    // 1. Get Active Year
    this.configService.getActiveAcademicYear().subscribe({
      next: (data) => this.activeYear = data,
      error: () => this.activeYear = null
    });

    // 2. Get All Years (History)
    // If you haven't made this API endpoint yet, comment this block out
    this.configService.getAllAcademicYears().subscribe({
      next: (data) => {
        this.allYears = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }


  createYear() {
    if (!this.newYear.name) return;

    this.newYear.id = this.newYear.name.replace(/\s+/g, '-');

    this.configService.createAcademicYear(this.newYear).subscribe({
      next: (res) => {
        alert('New Session Started!');
        this.newYear = { name: '', startDate: '', endDate: '', active: true };
        this.refreshData(); // <--- Reloads both Active card and History table
      },
      error: (err) => alert('Error creating year.')
    });
  }
}
