import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  link?: string;        // Optional: Only for items without children
  exact?: boolean;      // Optional: For Dashboard exact match
  children?: MenuItem[];// Optional: For Submenus
  isOpen?: boolean;     // Internal State: Is this menu expanded?
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

  // 2. The Master Configuration List
  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'bi-grid-1x2-fill',
      link: '/dashboard',
      exact: true
    },
    {
      title: 'Students',
      icon: 'bi-mortarboard-fill',
      isOpen: false, // Initial state
      children: [
        { title: 'All Students', icon: '', link: '/dashboard/students' }, // added icon property to match interface, can be empty
        { title: 'Add New', icon: '', link: '/dashboard/students/new' },
        { title: 'Manage Families', icon: '', link: '/dashboard/students/families' },
        { title: 'Active / Inactive', icon: '', link: '/dashboard/students/active' },
        { title: 'Admission Letter', icon: '', link: '/dashboard/students/admission-letter' },
        { title: 'Student ID Cards', icon: '', link: '/dashboard/students/id-cards' },
        { title: 'Print Basic List', icon: '', link: '/dashboard/students/print-list' },
        { title: 'Manage Login', icon: '', link: '/dashboard/students/login' },
        { title: 'Promote Students', icon: '', link: '/dashboard/students/promote' },
      ]
    },
    {
      title: 'Staff',
      icon: 'bi-person-workspace',
      isOpen: false,
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
        },
        {
          title: 'View Attendance',
          icon: '',
          link: '/dashboard/attendance/view',
        },
        {
          title: 'Class Register',
          icon: '',
          link: '/dashboard/attendance/register',
        },
        {
          title: 'Attendance Dashboard',
          icon: '',
          link: '/dashboard/attendance/dashboard',
        },
        {
          title: 'Reports',
          icon: '',
          link: '/dashboard/attendance/reports',
        },
        {
          title: 'Leave Requests',
          icon: '',
          link: '/dashboard/attendance/leaves',
        },
        {
          title: 'Settings',
          icon: '',
          link: '/dashboard/attendance/settings',
        },
      ]
    }
  ];

  onToggle() {
    // When sidebar closes, collapse all submenus
    this.menuItems.forEach(item => item.isOpen = false);
    this.toggle.emit();

  }

  private closeAllSubmenus() {
    this.menuItems.forEach(item => item.isOpen = false);
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
