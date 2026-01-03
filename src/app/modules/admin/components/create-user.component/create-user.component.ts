import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // ✅ Added ActivatedRoute
import { Auth } from '../../../../core/services/auth';
import { StaffService } from '../../../../modules/staff/services/staff.service';
import { UserService } from '../../services/user.service'; // ✅ Import UserService
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ToastService } from '../../../../core/services/toast';
import { Staff } from '../../../staff/models/staff';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private staffService = inject(StaffService);
  private userService = inject(UserService); // ✅ Inject User Service
  private toast = inject(ToastService);
  private router = inject(Router);
  public location = inject(Location);
  private route = inject(ActivatedRoute); // ✅ Inject ActivatedRoute

  isLoading = false;

  // Search State
  staffResults: Staff[] = [];
  isSearching = false;
  searchSubject = new Subject<string>();
  selectedStaffId: string | null = null;

  // Edit Mode State
  isEditMode = false;
  editUserId: string | null = null;

  // Roles Definition
  roles = [
    { label: 'ADMIN', value: 'ADMIN' },
    { label: 'PRINCIPAL', value: 'PRINCIPAL' },
    { label: 'TEACHER', value: 'TEACHER' },
    { label: 'ACCOUNTANT', value: 'ACCOUNTANT' },
    { label: 'PARENT', value: 'PARENT' }
  ];

  // Logic Flags
  isStaffRole = false;
  showClassField = false;
  showDeptField = false;

  userForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    adharNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
    userId: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roleName: ['', Validators.required],
    classId: [''],
    departmentId: [''],
    tenantId: ['1'],
    status: ['ACTIVE'],
    profileImageUrl: [''],
    permissions: [[]]
  });

  constructor() {
    // 1. 🚀 CHECK ROUTER STATE (Instant Data)
    // This catches the 'user' object passed from the List Page button
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { user: any };

    if (state && state.user) {
      this.isEditMode = true;
      this.editUserId = state.user.id;
      // We do this in constructor so form fills before view renders
      this.patchUserForm(state.user);
    }

    // 2. Handle Role Changes
    this.userForm.get('roleName')?.valueChanges.subscribe(role => {
      this.handleRoleChange(role);
    });

    // 3. Search Logic
    this.setupSearch();

    // 4. Handle Manual User ID Edit
    this.userForm.get('userId')?.valueChanges.subscribe(() => {
      if (this.isSearching || this.isEditMode) return; // Don't clear ID in edit mode
      this.selectedStaffId = null;
    });
  }

  ngOnInit() {
    // 🛡️ FALLBACK: If no state (e.g. page refresh), fetch by ID from URL
    if (!this.isEditMode) {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.editUserId = id;
          this.loadUserData(id);
        }
      });
    }
  }

  // ✅ Helper to Fill Form (Used by both State & API)
  patchUserForm(user: any) {
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      roleName: user.roleName,
      userId: user.userId, // Displays "TCH-001"
      status: user.status,
      adharNumber: user.adharNumber,
      // Passwords are typically not sent back for security. 
      // Leave blank or handle separately.
    });

    // 🔓 Remove Password Requirement in Edit Mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    // Trigger Role Logic to show/hide fields
    this.handleRoleChange(user.roleName);
  }

  loadUserData(id: string) {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const user = users.find(u => u.id === id);
        if (user) {
          this.patchUserForm(user);
        }
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('Could not load user', 'error');
        this.router.navigate(['/dashboard/admin']);
      }
    });
  }

  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.isSearching = true;
        return this.staffService.search({
          keyword: term,
          page: 0,
          size: 10,
          sortBy: 'name',
          direction: 'ASC',
        });
      })
    ).subscribe({
      next: (page) => {
        this.staffResults = page.content;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
        this.staffResults = [];
      }
    });
  }

  handleRoleChange(role: string) {
    this.showClassField = role === 'STUDENT';
    this.showDeptField = role === 'TEACHER';
    this.isStaffRole = ['ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT'].includes(role);

    if (!this.showClassField) this.userForm.get('classId')?.setValue(null);
    if (!this.showDeptField) this.userForm.get('departmentId')?.setValue(null);

    // Only clear search results if user is interacting
    if (!this.isEditMode) {
      this.staffResults = [];
    }
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    if (!term.trim()) {
      this.staffResults = [];
      return;
    }
    this.searchSubject.next(term);
  }

  selectStaff(staff: any) {
    let defaultPassword = 'School@123';
    if (staff.dateOfBirth && staff.adhaar) {
      const dobYear = new Date(staff.dateOfBirth).getFullYear();
      defaultPassword = `${dobYear}${staff.adhaar}`;
    }
    this.selectedStaffId = staff.id;
    this.userForm.patchValue({
      fullName: staff.fullName,
      email: staff.email,
      mobile: staff.mobile,
      departmentId: staff.departmentId || '',
      adharNumber: staff.adhaar,
      password: defaultPassword
    });
    this.userForm.get('userId')?.setValue(staff.employeeCode, { emitEvent: false });
    this.staffResults = [];
    this.toast.show('Staff details auto-filled!', 'info');
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.toast.show('Please fill all required fields correctly.', 'warning');
      return;
    }
    this.isLoading = true;

    // 1. Get raw form values
    const formValue = this.userForm.value;

    // 2. Construct the Payload matching your Java 'User' Class
    const payload: any = {
      ...formValue,
      // Logic: If we selected a staff via search, use that ID. Otherwise use what's typed.
      userId: this.selectedStaffId ? this.selectedStaffId : formValue.userId,

      // Ensure nulls for empty strings to keep DB clean
      classId: formValue.classId || null,
      departmentId: formValue.departmentId || null,
      profileImageUrl: formValue.profileImageUrl || null,
      permissions: formValue.permissions || []
    };

    // 3. 🛡️ PASSWORD SAFETY CHECK
    if (this.isEditMode) {
      // If editing and password is empty/blank, REMOVE it from payload.
      // This prevents overwriting the existing password with "".
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }
    }

    // 4. Send Request
    if (this.isEditMode && this.editUserId) {
      // ✅ UPDATE
      this.userService.updateUser(this.editUserId, payload).subscribe({
        next: () => {
          this.toast.show('User updated successfully!', 'success');
          this.isLoading = false;
          // Navigate back to the list
          this.router.navigate(['/dashboard/admin/view']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.show('Failed to update user. Check console.', 'error');
          console.error(err);
        }
      });
    } else {
      // ✅ CREATE
      this.auth.register(payload).subscribe({
        next: (res: any) => {
          this.toast.show(`User ${res.fullName} created successfully!`, 'success');
          this.isLoading = false;
          this.router.navigate(['/dashboard/admin/view']);
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.show(err.error?.message || 'Failed to create user', 'error');
        }
      });
    }
  }
}