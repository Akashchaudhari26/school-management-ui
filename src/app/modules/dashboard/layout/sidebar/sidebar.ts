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

  currentUserRole: UserRole = 'ADMIN'; // Default for testing, get real one from Auth Service
  finalMenuItems: MenuItem[] = [];

  // 2. The Master Configuration List

  // Master Menu Configuration
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
      allowedRoles: ['ADMIN', 'PRINCIPAL', 'TEACHER'], // Parents/Students don't manage students
      children: [
        {
          title: 'All Students',
          icon: '',
          link: '/dashboard/students',
          allowedRoles: ['ADMIN', 'PRINCIPAL', 'TEACHER']
        },
        {
          title: 'Add New',
          icon: '',
          link: '/dashboard/students/new',
          allowedRoles: ['ADMIN', 'PRINCIPAL'] // Teachers usually don't admit students
        },
        { title: 'Manage Families', icon: '', link: '/dashboard/students/families', allowedRoles: ['ADMIN', 'PRINCIPAL'] },
        { title: 'Active / Inactive', icon: '', link: '/dashboard/students/active', allowedRoles: ['ADMIN', 'PRINCIPAL'] },
        { title: 'Admission Letter', icon: '', link: '/dashboard/students/admission-letter', allowedRoles: ['ADMIN'] },
        { title: 'Student ID Cards', icon: '', link: '/dashboard/students/id-cards', allowedRoles: ['ADMIN', 'PRINCIPAL'] },
        { title: 'Print Basic List', icon: '', link: '/dashboard/students/print-list', allowedRoles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] },
        { title: 'Manage Login', icon: '', link: '/dashboard/students/login', allowedRoles: ['ADMIN'] },
        { title: 'Promote Students', icon: '', link: '/dashboard/students/promote', allowedRoles: ['ADMIN', 'PRINCIPAL'] },
      ]
    },
    {
      title: 'Staff',
      icon: 'bi-person-workspace',
      isOpen: false,
      allowedRoles: ['ADMIN', 'PRINCIPAL'], // Teachers shouldn't see staff management
      children: [
        { title: 'All Staff', icon: '', link: '/dashboard/staff' },
        { title: 'Add New Staff', icon: '', link: '/dashboard/staff/new' },
        { title: 'Staff Attendance', icon: '', link: '/dashboard/staff/attendance' },
        { title: 'Leave Requests', icon: '', link: '/dashboard/staff/leaves' },
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
          allowedRoles: ['ADMIN', 'PRINCIPAL', 'TEACHER']
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
          allowedRoles: ['ADMIN', 'PRINCIPAL', 'TEACHER']
        },
        {
          title: 'Attendance Dashboard',
          icon: '',
          link: '/dashboard/attendance/dashboard',
          allowedRoles: ['ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Reports',
          icon: '',
          link: '/dashboard/attendance/reports',
          allowedRoles: ['ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Leave Requests',
          icon: '',
          link: '/dashboard/attendance/leaves',
          allowedRoles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] // Teachers might approve, or just Admin
        },
        {
          title: 'Settings',
          icon: '',
          link: '/dashboard/attendance/settings',
          allowedRoles: ['ADMIN']
        },
      ]
    },
    {
      title: 'Fee Management',
      icon: 'bi-currency-exchange',
      isOpen: false,
      allowedRoles: ['ADMIN', 'PRINCIPAL'],
      children: [
        {
          title: 'Fee Structures',
          icon: '',
          link: '/dashboard/fees/create',
          allowedRoles: ['ADMIN']
        },
        {
          title: 'Collect Fees',
          icon: '',
          link: '/dashboard/fees/collect',
          allowedRoles: ['ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Due Dashboard',
          icon: '',
          link: '/dashboard/fees/dues',
          allowedRoles: ['ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Student History',
          icon: '',
          link: '/dashboard/fees/history',
          allowedRoles: ['ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Bulk Fee Upload',
          icon: '',
          link: '/dashboard/fees/bulk-create',
          allowedRoles: ['ADMIN', 'PRINCIPAL']
        },
        {
          title: 'Fee Master Data',
          icon: '',
          link: '/dashboard/fees/fee-master',
          allowedRoles: ['ADMIN', 'PRINCIPAL']
        }
      ]
    },
    {
      title: 'Admin Panel',
      icon: 'bi-shield-lock-fill', // Professional Admin Icon
      allowedRoles: ['ADMIN'], // <--- Key Property
      isOpen: false,
      children: [
        {
          title: 'Create User',
          icon: '',
          link: '/dashboard/admin/create',
          allowedRoles: ['ADMIN']
        },
        {
          title: 'View User',
          icon: '',
          link: '/dashboard/admin/view',
          allowedRoles: ['ADMIN']
        }]
    }
  ];

  constructor(private authService: Auth) { }

  ngOnInit() {
    this.currentUserRole = this.authService.getRole();
    this.finalMenuItems = this.filterMenuByRole(this.rawMenuItems, this.currentUserRole);
  }

  // --- RECURSIVE FILTER LOGIC ---
  filterMenuByRole(items: MenuItem[], role: string): MenuItem[] {
    return items.filter(item => {
      // Step A: Check if this item has an 'allowedRoles' restriction
      // If allowedRoles is undefined, everyone sees it.
      // If defined, the user's role MUST be in the array.
      const isAllowed = !item.allowedRoles || item.allowedRoles.includes(role as any);

      if (!isAllowed) return false;

      // Step B: Filter children recursively
      if (item.children && item.children.length > 0) {
        item.children = this.filterMenuByRole(item.children, role);

        // Step C: Cleanup - If a parent has no children left after filtering, 
        // and it has no link itself (it was just a group header), hide it.
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
  handleItemClick(item: MenuItem) {
    if (item.children) {
      // If it's a parent, run the toggle logic
      this.toggleSubmenu(item);
    } else {
      // If it's a direct link (Dashboard, Fees, etc.), close all dropdowns
      this.closeAllSubmenus();
    }
  }

  // 3. Generic Toggle for ANY Submenu
  toggleSubmenu(item: MenuItem) {
    if (!item.children) return;

    if (this.isCollapsed) {
      this.toggle.emit();
      item.isOpen = true;
    } else {
      // 1. Toggle the clicked item
      const wasOpen = item.isOpen;

      // 2. 🚀 THE FIX: Close ALL other menus first
      this.closeAllSubmenus();

      // 3. If it was closed before, open it now. 
      // (If it was already open, step 2 closed it, so we leave it closed)
      if (!wasOpen) {
        item.isOpen = true;
      }
    }
  }
}
