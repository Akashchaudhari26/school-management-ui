import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { StaffService } from '../../services/staff.service';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { Staff } from '../../models/staff';
import { CommonModule, Location } from '@angular/common';
import { DropdownOption, StudentService } from '../../../student/services/student.service';

@Component({
  selector: 'app-staff-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './staff-form.html',
  styleUrl: './staff-form.css',
})
export class StaffForm {
  private fb = inject(FormBuilder);
  private staffService = inject(StaffService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  public location = inject(Location); // Used for "Back" button


  staffForm: FormGroup;
  isEditMode = false;
  staffId: string | null = null;
  isLoading = false;

  // Master Data (Move to Service later if dynamic)
  staffTypes = ['TEACHER', 'NON_TEACHING', 'ADMIN'];
  designations = ['Principal', 'Vice Principal', 'Teacher', 'Clerk', 'Peon', 'Driver', 'Security'];

  // Available Options for Checkboxes
  availableClasses: Observable<DropdownOption[]> = this.studentService.getClasses();
  availableSubjects = ['English', 'Mathematics', 'EVS', 'Hindi', 'Art & Craft', 'Music', 'Sports'];

  constructor() {
    this.staffForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      adhaar: ['', [Validators.pattern(/^[0-9]{12}$/)]],

      // Professional Details
      staffType: ['TEACHER', Validators.required],
      designation: ['', Validators.required],
      joiningDate: [new Date().toISOString().split('T')[0], Validators.required], // Default today
      employeeCode: ['', Validators.required],

      // Lists (Handled as FormArrays for Multi-select)
      subjects: this.fb.array([]),
      assignedClassIds: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.staffId = this.route.snapshot.paramMap.get('id');
    if (this.staffId) {
      this.isEditMode = true;
      this.loadStaffData(this.staffId);
    }
  }

  // Helper for Template
  get f() { return this.staffForm.controls; }

  // Helpers for Checkboxes
  onCheckChange(event: any, formArrayName: string) {
    const formArray: FormArray = this.staffForm.get(formArrayName) as FormArray;
    if (event.target.checked) {
      formArray.push(this.fb.control(event.target.value));
    } else {
      const index = formArray.controls.findIndex(x => x.value === event.target.value);
      formArray.removeAt(index);
    }
  }

  // Check if value exists in array (for Edit Mode)
  isChecked(value: string, formArrayName: string): boolean {
    const formArray = this.staffForm.get(formArrayName) as FormArray;
    return formArray.value.includes(value);
  }

  loadStaffData(id: string) {
    this.isLoading = true;
    this.staffService.getById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(data => {
        // Patch simple fields
        this.staffForm.patchValue(data);

        // Patch Arrays (Subjects & Classes) manually
        const subjectsArray = this.staffForm.get('subjects') as FormArray;
        data.subjects?.forEach(sub => subjectsArray.push(this.fb.control(sub)));

        const classesArray = this.staffForm.get('assignedClassIds') as FormArray;
        data.assignedClassIds?.forEach(cls => classesArray.push(this.fb.control(cls)));
      });
  }

  onSubmit() {
    if (this.staffForm.invalid) return;

    this.isLoading = true;
    const staffData: Staff = this.staffForm.value;

    const request$ = this.isEditMode
      ? this.staffService.update(this.staffId!, staffData)
      : this.staffService.create(staffData);

    request$.pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => this.router.navigate(['/dashboard/staff']),
        error: (err) => console.error('Error saving staff:', err)
      });
  }
}
