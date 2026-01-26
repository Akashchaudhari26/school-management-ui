import { Component } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { PayrollTransaction } from '../../models/payroll.model';
import { PayrollService } from '../../services/payroll.service';

@Component({
  selector: 'app-payroll-ledger.component',
  imports: [COMMON_IMPORTS],
  templateUrl: './payroll-ledger.component.html',
  styleUrl: './payroll-ledger.component.css',
})
export class PayrollLedgerComponent {
  // Filter State
  selectedMonth: string;
  selectedYear: number;
  months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  years: number[] = [];

  // Data State
  ledger: PayrollTransaction[] = [];
  isLoading = false;

  // Financial Summary (Calculated)
  summary = {
    totalStaff: 0,
    totalLiability: 0, // Total Amount Needed
    totalPaid: 0,      // Amount already released
    totalPending: 0    // Amount yet to pay
  };

  constructor(private payrollService: PayrollService) {
    const today = new Date();
    this.selectedMonth = this.months[today.getMonth()];
    this.selectedYear = today.getFullYear();

    // Populate last 3 years
    for (let i = 0; i < 3; i++) {
      this.years.push(this.selectedYear - i);
    }
  }

  ngOnInit(): void {
    this.fetchLedger();
  }

  fetchLedger() {
    this.isLoading = true;
    this.payrollService.viewPayroll(this.selectedMonth, this.selectedYear).subscribe({
      next: (data) => {
        this.ledger = data;
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load ledger', err);
        this.isLoading = false;
      }
    });
  }

  calculateSummary() {
    this.summary = {
      totalStaff: this.ledger.length,
      totalLiability: 0,
      totalPaid: 0,
      totalPending: 0
    };

    this.ledger.forEach(txn => {
      this.summary.totalLiability += txn.netPayable;

      if (txn.status === 'PAID') {
        this.summary.totalPaid += txn.netPayable;
      } else {
        this.summary.totalPending += txn.netPayable;
      }
    });
  }

  // Feature: Export Data to CSV
  downloadCSV() {
    if (this.ledger.length === 0) return;

    const headers = ['Staff Name', 'Role', 'Month', 'Present Days', 'Gross Earnings', 'Deductions', 'Net Pay', 'Status'];
    const rows = this.ledger.map(txn => [
      txn.staffName,
      'TEACHER', // You might want to add role to your Transaction model later
      `${txn.month} ${txn.year}`,
      txn.presentDays,
      txn.totalEarnings,
      txn.totalDeductions,
      txn.netPayable,
      txn.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";

    rows.forEach(row => {
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Ledger_${this.selectedMonth}_${this.selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
