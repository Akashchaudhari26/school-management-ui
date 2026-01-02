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
  public location = inject(Location);

  staffForm: FormGroup;
  isEditMode = false;
  staffId: string | null = null;
  isLoading = false;

  staffTypes = ['TEACHING', 'NON_TEACHING', 'ADMIN'];
  designations = ['PRINCIPAL', 'VICE PRINCIPAL', 'TEACHER', 'CLEARK', 'PEON', 'DRIVER', 'SECURITY'];

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
      staffType: ['', Validators.required],
      designation: ['', Validators.required],
      joiningDate: [new Date().toISOString().split('T')[0], Validators.required],
      employeeCode: [{ value: '', disabled: true }],
      subjects: this.fb.array([]),
      assignedClassIds: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.staffId = this.route.snapshot.paramMap.get('id');

    if (this.staffId) {
      this.isEditMode = true;

      // 1. Check if data was passed via Router State (Optimized)
      const navigationState = history.state;

      if (navigationState && navigationState.staff) {
        console.log('Loaded from State (No API Call)');
        this.populateForm(navigationState.staff);
      } else {
        // 2. Fallback to API if page was refreshed or accessed directly
        console.log('Loaded from API');
        this.loadStaffData(this.staffId);
      }
    }
  }

  // --- Helper to Populate Form (Used by both State and API) ---
  populateForm(data: Staff) {
    // Patch simple fields
    this.staffForm.patchValue(data);

    // Patch Arrays (Clear first to avoid duplicates if re-populated)
    const subjectsArray = this.staffForm.get('subjects') as FormArray;
    subjectsArray.clear();
    data.subjects?.forEach(sub => subjectsArray.push(this.fb.control(sub)));

    const classesArray = this.staffForm.get('assignedClassIds') as FormArray;
    classesArray.clear();
    data.assignedClassIds?.forEach(cls => classesArray.push(this.fb.control(cls)));
  }

  loadStaffData(id: string) {
    this.isLoading = true;
    this.staffService.getById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(data => {
        this.populateForm(data);
      });
  }

  get f() { return this.staffForm.controls; }

  onCheckChange(event: any, formArrayName: string) {
    const formArray: FormArray = this.staffForm.get(formArrayName) as FormArray;
    if (event.target.checked) {
      formArray.push(this.fb.control(event.target.value));
    } else {
      const index = formArray.controls.findIndex(x => x.value === event.target.value);
      formArray.removeAt(index);
    }
  }

  isChecked(value: string, formArrayName: string): boolean {
    const formArray = this.staffForm.get(formArrayName) as FormArray;
    return formArray.value.includes(value);
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