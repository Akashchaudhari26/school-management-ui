import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth, UserRole } from '../../../../core/services/auth';


export interface MenuItem {
  title: string;
  icon: string;
  link?: string;
  exact?: boolean;
  isOpen?: boolean;
  children?: MenuItem[];
  allowedRoles?: UserRole[]; // <--- NEW FIELD
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() toggle = new EventEmitter<void>();

  currentUserRole: UserRole = 'ADMIN';
  finalMenuItems: MenuItem[] = [];

  private readonly rawMenuItems: MenuItem[] = [

    {
      title: 'Dashboard',
      icon: 'bi-grid-1x2-fill',
      link: '/dashboard',
      exact: true,
      // No allowedRoles = Visible to everyone
    },
    {
      title: 'Students',
      icon: 'bi-mortarboard-fill',
      isOpen: false,
      allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER'], // Parents/Students don't manage students
      children: [
        {
          title: 'All Students',
          icon: '',
          link: '/dashboard/students',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER']
        },
        {
          title: 'Add New',
          icon: '',
          link: '/dashboard/students/new',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] // Teachers usually don't admit students
        },
        { title: 'Manage Families', icon: '', link: '/dashboard/students/families', allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
        { title: 'Active / Inactive', icon: '', link: '/dashboard/students/active', allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
        { title: 'Admission Letter', icon: '', link: '/dashboard/students/admission-letter', allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN'] },
        { title: 'Student ID Cards', icon: '', link: '/dashboard/students/id-cards', allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
        { title: 'Print Basic List', icon: '', link: '/dashboard/students/print-list', allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { title: 'Manage Login', icon: '', link: '/dashboard/students/login', allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN'] },
        { title: 'Promote Students', icon: '', link: '/dashboard/students/promote', allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
      ]
    },
    {
      title: 'Academics & Exams',
      icon: 'bi-journal-bookmark-fill',
      isOpen: false,
      allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'],
      children: [
        {
          title: 'Time Table',
          icon: '',
          link: '/dashboard/exams/time-table',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT'] // Students can't enter marks
        },
        {
          title: 'Enter Marks',
          icon: '',
          link: '/dashboard/exams/entry',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER'] // Students can't enter marks
        },
        {
          title: 'View Mark Sheet',
          icon: '',
          link: '/dashboard/exams/sheet',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER'] // Teachers review class performance
        },
        {
          title: 'Report Cards',
          icon: '',
          link: '/dashboard/exams/reports',
          // Everyone can see this (Logic: Teachers see Class, Student sees Self)
        },
        {
          title: 'Exam Settings',
          icon: '',
          link: '/dashboard/exams/settings',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN'] // To configure Grade Rules (A+ > 90), Exam Names
        }
      ]
    },
    {
      title: 'Staff',
      icon: 'bi-person-workspace',
      isOpen: false,
      allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'], // Teachers shouldn't see staff management
      children: [
        { title: 'All Staff', icon: '', link: '/dashboard/staff' },
        { title: 'Add New Staff', icon: '', link: '/dashboard/staff/new' },
        { title: 'Staff Attendance', icon: '', link: '/dashboard/staff/attendance' },
        { title: 'Leave Requests', icon: '', link: '/dashboard/staff/leaves' },
      ]
    },
    {
      title: 'Payroll & HR',
      icon: 'bi-cash-coin', // Good icon for money/salary
      isOpen: false,
      allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN'], // Only Admin should see salary data
      children: [
        { title: 'Salary Setup', icon: '', link: '/dashboard/payroll/structure' },
        { title: 'Generate Payroll', icon: '', link: '/dashboard/payroll/generate' },
        { title: 'Salary Ledger', icon: '', link: '/dashboard/payroll/view' }, // View history
      ]
    },
    {
      title: 'Attendance',
      icon: 'bi-calendar-check-fill',
      isOpen: false,
      children: [
        {
          title: 'Mark Attendance',
          icon: '',
          link: '/dashboard/attendance/mark',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER']
        },
        {
          title: 'View Attendance',
          icon: '',
          link: '/dashboard/attendance/view',
          // Everyone can view (Parents see their child, Teachers see class)
        },
        {
          title: 'Class Register',
          icon: '',
          link: '/dashboard/attendance/class-register',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER']
        },
        {
          title: 'Attendance Dashboard',
          icon: '',
          link: '/dashboard/attendance/dashboard',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Reports',
          icon: '',
          link: '/dashboard/attendance/reports',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Leave Requests',
          icon: '',
          link: '/dashboard/attendance/leaves',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER'] // Teachers might approve, or just Admin
        },
        {
          title: 'Settings',
          icon: '',
          link: '/dashboard/attendance/settings',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN']
        },
      ]
    },
    {
      title: 'Fee Management',
      icon: 'bi-currency-exchange',
      isOpen: false,
      allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'],
      children: [
        {
          title: 'Fee Structures',
          icon: '',
          link: '/dashboard/fees/create',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN']
        },
        {
          title: 'Collect Fees',
          icon: '',
          link: '/dashboard/fees/collect',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Due Dashboard',
          icon: '',
          link: '/dashboard/fees/dues',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Student History',
          icon: '',
          link: '/dashboard/fees/history',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Bulk Fee Upload',
          icon: '',
          link: '/dashboard/fees/bulk-create',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Fee Master Data',
          icon: '',
          link: '/dashboard/fees/fee-master',
          allowedRoles: ['SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'PRINCIPAL']
        }
      ]
    },
    {
      title: 'School Configuration', // <--- I ADDED THIS FOR YOUR NEW MODULE
      icon: 'bi-gear-fill',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
      isOpen: false,
      children: [
        { title: 'Academic Years', icon: '', link: '/dashboard/config/years' },
        { title: 'Classes & Sections', icon: '', link: '/dashboard/config/classes' },
        { title: 'Subjects', icon: '', link: '/dashboard/config/subjects' },
      ]
    },
    {
      title: 'Admin Panel',
      icon: 'bi-shield-lock-fill', // Professional Admin Icon
      allowedRoles: ['SUPER_ADMIN', 'ADMIN'], // <--- Key Property
      isOpen: false,
      children: [
        {
          title: 'Create User',
          icon: '',
          link: '/dashboard/admin/create',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN']
        },
        {
          title: 'View User',
          icon: '',
          link: '/dashboard/admin/view',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN']
        }]
    },
    {
      title: 'My Profile',
      icon: 'bi-person-circle',
      isOpen: false,
      allowedRoles: ['TEACHER', 'PRINCIPAL', 'LIBRARIAN', 'ACCOUNTANT', 'SUPER_ADMIN', 'ADMIN'], // Not for Admin (Admin has their own view)
      children: [
        // ... maybe 'My Attendance'
        {
          title: 'My Payslips',
          icon: 'bi-file-earmark-text',
          link: '/dashboard/payroll/my-slips'
        },
      ]
    },
  ];

  constructor(private authService: Auth) { }

  ngOnInit() {
    this.currentUserRole = this.authService.getRole();
    this.finalMenuItems = this.filterMenuByRole(this.rawMenuItems, this.currentUserRole);
  }

  filterMenuByRole(items: MenuItem[], role: string): MenuItem[] {
    return items.filter(item => {
      const isAllowed = !item.allowedRoles || item.allowedRoles.includes(role as any);

      if (!isAllowed) return false;

      if (item.children && item.children.length > 0) {
        item.children = this.filterMenuByRole(item.children, role);
        if (item.children.length === 0 && !item.link) {
          return false;
        }
      }

      return true;
    });
  }

  onToggle() {
    // When sidebar closes, collapse all submenus
    this.finalMenuItems.forEach(item => item.isOpen = false);
    this.toggle.emit();

  }

  private closeAllSubmenus() {
    this.finalMenuItems.forEach(item => item.isOpen = false);
  }

  // 2. New Main Handler for ALL clicks
  handleItemClick(event: Event, item: MenuItem) {
    if (item.children) {
      // If it's a parent, run the toggle logic
      event.preventDefault();
      event.stopPropagation();
      this.toggleSubmenu(item);
    } else {
      // If it's a direct link (Dashboard, Fees, etc.), close all dropdowns
      this.closeAllSubmenus();
      if (this.isMobileOpen) {
        this.toggle.emit(); // Close the sidebar
      }
    }
  }

  onSubItemClick() {
    if (this.isMobileOpen) {
      this.toggle.emit();
    }
  }

  toggleSubmenu(item: MenuItem) {
    if (!item.children) return;

    if (this.isCollapsed) {
      this.toggle.emit();
      item.isOpen = true;
    } else {
      const wasOpen = item.isOpen;

      this.closeAllSubmenus();
      if (!wasOpen) {
        item.isOpen = true;
      }
    }
  }
}
