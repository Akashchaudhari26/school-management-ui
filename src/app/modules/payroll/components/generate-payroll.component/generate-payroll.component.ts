import { Component, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { PayrollTransaction } from '../../models/payroll.model';
import { PayrollService } from '../../services/payroll.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-generate-payroll.component',
  imports: [COMMON_IMPORTS],
  templateUrl: './generate-payroll.component.html',
  styleUrl: './generate-payroll.component.css',
})
export class PayrollGenerateComponent implements OnInit {

  // State
  selectedMonth: string;
  selectedYear: number;
  payrollList: PayrollTransaction[] = [];
  isLoading = false;
  selectedSlip: PayrollTransaction | null = null;

  // Dropdown Data
  months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  years: number[] = [];

  schoolProfile = {
    name: 'Matrutva Little Buds', // Replace with your actual client name
    address: 'Sangrampur 444202, Near Vitthal Mandir',
    contact: 'Email: matrutva.edu@gmail.com | Ph: +91 70283 01416',
    logoUrl: 'assets/logo.png' // Optional: If you have a logo
  };

  constructor(private payrollService: PayrollService) {
    const today = new Date();
    this.selectedMonth = this.months[today.getMonth()]; // Default to current month
    this.selectedYear = today.getFullYear();

    // Populate last 3 years
    for (let i = 0; i < 3; i++) {
      this.years.push(this.selectedYear - i);
    }
  }

  ngOnInit(): void {
    // Optional: Auto-load on view? Better to let user click "View"
    this.fetchPayroll();
  }

  // 1. View Existing Ledger (Without Regenerating)
  fetchPayroll() {
    this.isLoading = true;
    this.payrollService.viewPayroll(this.selectedMonth, this.selectedYear).subscribe({
      next: (data) => {
        this.payrollList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // 2. Trigger the Engine (Calculates new values)
  generateNew() {
    if (!confirm(`Are you sure you want to generate payroll for ${this.selectedMonth} ${this.selectedYear}? This will calculate salaries based on attendance.`)) {
      return;
    }

    this.isLoading = true;
    this.payrollService.generatePayroll(this.selectedMonth, this.selectedYear).subscribe({
      next: (data) => {
        this.payrollList = data;
        this.isLoading = false;
        alert('Payroll Calculation Complete!');
      },
      error: (err) => {
        alert('Error generating payroll. Ensure Attendance is marked.');
        this.isLoading = false;
      }
    });
  }

  getBadgeClass(status: string): string {
    return status === 'PAID' ? 'bg-success' : 'bg-warning text-dark';
  }

  markAsPaid(txn: PayrollTransaction) {
    if (!confirm(`Confirm payment for ${txn.staffName}?`)) return;

    this.payrollService.markAsPaid(txn.id).subscribe({
      next: () => {
        // Update UI locally without reloading
        txn.status = 'PAID';
        alert('Status updated to PAID');
      },
      error: () => alert('Failed to update status')
    });
  }

  // ACTION 2: Prepare & Download PDF
  downloadSlip(txn: PayrollTransaction) {
    this.selectedSlip = txn; // This injects data into the hidden HTML template

    // Allow Angular 100ms to render the hidden template with new data
    setTimeout(() => {
      this.generatePDF();
    }, 100);
  }

  generatePDF() {
    const data = document.getElementById('payslip-template'); // The ID of the hidden HTML
    if (!data) return;

    html2canvas(data, { scale: 2 }).then(canvas => {
      // Setup A4 Landscape or Portrait
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      // Filename: Payslip_Jan_2026_JohnDoe.pdf
      pdf.save(`Payslip_${this.selectedSlip?.month}_${this.selectedSlip?.staffName}.pdf`);
    });
  }
}