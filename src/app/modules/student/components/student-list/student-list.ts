import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize, Observable, of, startWith, switchMap } from 'rxjs';

import { Student } from '../../models/student';
import { DropdownOption, StudentService } from '../../services/student.service';
import { StudentSearchFilter } from '../../models/student-filter';
import { StudentTableComponent } from "../student-table.component/student-table.component";

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, StudentTableComponent],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
})
export class StudentList implements OnInit {
  private studentService = inject(StudentService);

  // UI State
  students: Student[] = [];
  private fb = inject(FormBuilder); // Inject FormBuilder
  private router = inject(Router);

  filterForm = this.fb.group({
    keyword: [''],
    classId: [''],
    section: [''],
    admissionYear: [] // Default to current year or set to null
  });
  isLoading = false;

  // Pagination State
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // 🚀 Dynamic Data Streams
  classes$: Observable<DropdownOption[]> = this.studentService.getClasses();
  sections$: Observable<DropdownOption[]> = of([]);

  ngOnInit() {
    this.fetchStudents();

    const classFilter = this.filterForm.get('classId');

    if (classFilter) {
      this.sections$ = classFilter.valueChanges.pipe(
        startWith(classFilter.value || ''),
        switchMap(id => this.studentService.getSections(id || ''))
      );
    }

  }


  // 1. Called when user clicks "Search" or hits Enter
  onSearch() {
    this.currentPage = 0; // Reset to first page for a new search
    this.fetchStudents();
  }

  // 2. Called when user clicks "Next/Previous"
  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchStudents(); // Fetch data for the specific page
    }
  }

  resetFilters() {
    this.filterForm.reset({
      keyword: '',
      classId: '',
      section: '',
      admissionYear: null
    });
    this.onSearch();
  }
  // 3. Centralized API Call
  private fetchStudents() {
    this.isLoading = true;
    const formVal = this.filterForm.value;
    // 1. Construct the Filter Object based on your Java DTO
    const filter: StudentSearchFilter = {
      keyword: formVal.keyword || '',
      classId: formVal.classId || undefined,     // Send undefined/null if empty
      section: formVal.section || undefined,
      admissionYear: formVal.admissionYear || undefined,
      status: 'ACTIVE',                          // Default hardcoded or add to form

      // Pagination
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'lastName',
      direction: 'ASC'
    };

    // 2. Call the service with the object
    this.studentService.search(filter)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (page) => {
          this.students = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.currentPage = page.number;
        },
        error: (err) => console.error('Error fetching students:', err)
      });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.delete(id).subscribe(() => this.fetchStudents());
    }
  }

  onView(student: any) {
    this.router.navigate(
      ['/dashboard/students/view', student.id],
      { state: { student } }
    );
  }
  onEdit(student: any) {
    this.router.navigate(
      ['/dashboard/students/edit', student.id],
      { state: { student } }
    );
  }
}