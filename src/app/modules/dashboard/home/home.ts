import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  stats = [
    {
      title: 'Total Students',
      value: '450',
      subtext: '+12 this month',
      icon: 'bi-mortarboard-fill',
      color: 'primary',
      bg: 'bg-primary-subtle',
      link: '/dashboard/students'
    },
    {
      title: 'Total Staff',
      value: '24',
      subtext: '2 on leave today',
      icon: 'bi-person-workspace',
      color: 'success',
      bg: 'bg-success-subtle',
      link: '/dashboard/staff'
    },
    {
      title: 'Fee Collection',
      value: '₹ 1.2L',
      subtext: 'Updated 1 hour ago',
      icon: 'bi-currency-rupee',
      color: 'warning',
      bg: 'bg-warning-subtle',
      link: '/dashboard/fees/dues'
    },
    {
      title: 'Avg Attendance',
      value: '92%',
      subtext: 'Higher than last week',
      icon: 'bi-graph-up-arrow',
      color: 'info',
      bg: 'bg-info-subtle',
      link: '/dashboard/attendance/dashboard'
    }
  ];

  recentActivities = [
    { text: 'New student "Aarav Patel" admitted to Nursery', time: '2 mins ago', icon: 'bi-person-plus', color: 'text-success' },
    { text: 'Lakshmi Chaudhari marked morning attendance', time: '15 mins ago', icon: 'bi-check-circle', color: 'text-primary' },
    { text: 'Fee receipt generated for "Riya Sharma"', time: '1 hour ago', icon: 'bi-receipt', color: 'text-warning' },
    { text: 'Weekly staff meeting scheduled', time: '5 hours ago', icon: 'bi-calendar-event', color: 'text-info' }
  ];
}
