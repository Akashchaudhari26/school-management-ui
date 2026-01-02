import { Component, inject } from '@angular/core';
import { StaffService } from '../../services/staff.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Staff, StaffSearchFilter } from '../../models/staff';
import { finalize, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DropdownOption } from '../../../student/services/student.service';
import { StaffTableComponent } from "../staff-table.component/staff-table.component";

@Component({
  selector: 'app-staff-list',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, StaffTableComponent],
  templateUrl: './staff-list.html',
  styleUrl: './staff-list.css',
})
export class StaffList {
  private staffService = inject(StaffService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  staffList: Staff[] = [];
  isLoading = false;

  roles: Observable<DropdownOption[]> = this.staffService.getDesignations();
  designations: Observable<DropdownOption[]> = this.staffService.getStaffTypes();

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  filterForm = this.fb.group({
    keyword: [''],
    staffType: [''],
    designation: ['']
  });

  ngOnInit() {
    this.fetchStaff();
  }

  onSearch() {
    this.currentPage = 0;
    this.fetchStaff();
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchStaff();
    }
  }

  resetFilters() {
    this.filterForm.reset({ keyword: '', staffType: '', designation: '' });
    this.onSearch();
  }

  private fetchStaff() {
    this.isLoading = true;
    const formVal = this.filterForm.value;

    const filter: StaffSearchFilter = {
      keyword: formVal.keyword || '',
      staffType: formVal.staffType || undefined,
      designation: formVal.designation || undefined,

      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'fullName',
      direction: 'ASC'
    };

    this.staffService.search(filter)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (page) => {
          this.staffList = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.currentPage = page.number;
        },
        error: (err) => console.error('Error fetching staff:', err)
      });
  }

  deleteStaff(id: string) {
    if (confirm('Are you sure you want to delete this staff member?')) {
      this.staffService.delete(id).subscribe(() => this.fetchStaff());
    }
  }

  onView(staff: any) { this.router.navigate(['/dashboard/staff/view', staff.id]); }
  onEdit(staff: any) { this.router.navigate(['/dashboard/staff/edit', staff.id], { state: { staff } }); }
  onDelete(id: string) { /* delete logic */ }
}
