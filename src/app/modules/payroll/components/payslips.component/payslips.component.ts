import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { PayrollTransaction } from '../../models/payroll.model';
import { PayrollService } from '../../services/payroll.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Auth } from '../../../../core/services/auth';
import Chart from 'chart.js/auto';
import { AcademicYear } from '../../../school-config/models/school-config';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';

@Component({
  selector: 'app-payslips.component',
  imports: [COMMON_IMPORTS],
  templateUrl: './payslips.component.html',
  styleUrl: './payslips.component.css',
})
export class PayslipsComponent {
  private authService = inject(Auth);

  rawHistory: PayrollTransaction[] = []; // Original data
  filteredHistory: PayrollTransaction[] = []; // Data shown in UI
  isLoading = false;

  // Filter State
  academicYears: AcademicYear[] = [];
  availableYears: number[] = [];
  selectedYear: number | string = 'ALL';
  selectedStatus: string = 'ALL';

  ytdEarnings: number = 0;
  avgNetPay: number = 0;

  // PDF Generation State
  selectedSlip: PayrollTransaction | null = null;

  // School Info for PDF
  schoolProfile = {
    name: 'AKASH INTERNATIONAL SCHOOL',
    address: 'Plot No. 45, Tech Park Road, Pune, Maharashtra',
    contact: 'Email: admin@akashschool.com'
  };

  private monthMap: { [key: string]: number } = {
    'JANUARY': 0, 'FEBRUARY': 1, 'MARCH': 2, 'APRIL': 3, 'MAY': 4, 'JUNE': 5,
    'JULY': 6, 'AUGUST': 7, 'SEPTEMBER': 8, 'OCTOBER': 9, 'NOVEMBER': 10, 'DECEMBER': 11
  };

  chart: any;
  @ViewChild('salaryChart') salaryChartRef!: ElementRef;

  constructor(private payrollService: PayrollService, private configService: SchoolConfigService) { }

  ngOnInit(): void {
    this.refresh();
    this.loadAcademicYears()
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data loads
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  refresh() {
    const user = this.authService.getUser();
    const staffId = user?.userId || '';

    if (staffId) {
      this.loadHistory(staffId);
    }
  }

  loadHistory(staffId: string) {
    this.isLoading = true;
    this.payrollService.getMyHistory(staffId).subscribe({
      next: (data) => {
        // 1. Store Raw Data (Exclude DRAFTs)
        this.rawHistory = data
          .sort((a, b) => {
            // Sort Chronologically for the Chart
            const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
            if (a.year !== b.year) return a.year - b.year;
            return months.indexOf(a.month) - months.indexOf(b.month);
          });

        // 2. Extract Years for Filter
        this.availableYears = [...new Set(this.rawHistory.map(item => item.year))].sort((a, b) => b - a);

        // 3. Apply Filters & Calc Metrics
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  applyFilters() {
    this.filteredHistory = this.rawHistory.filter(item => {

      // --- Filter 1: Calendar Year Logic (Jan to Dec) ---
      let matchYear = true;

      if (this.selectedYear !== 'ALL') {
        // Simple comparison: Does the payslip year match the selected year?
        matchYear = item.year === Number(this.selectedYear);
      }

      // --- Filter 2: Status Logic ---
      const matchStatus = this.selectedStatus === 'ALL' || item.status === this.selectedStatus;

      return matchYear && matchStatus;
    });

    this.calculateMetrics();
    setTimeout(() => this.initChart(), 0);
  }

  calculateMetrics() {
    if (this.filteredHistory.length === 0) {
      this.ytdEarnings = 0;
      this.avgNetPay = 0;
      return;
    }

    // Sum of Net Pay
    const totalNet = this.filteredHistory.reduce((sum, item) => sum + item.netPayable, 0);
    this.ytdEarnings = totalNet;
    this.avgNetPay = totalNet / this.filteredHistory.length;
  }

  initChart() {
    if (!this.salaryChartRef) return;

    const ctx = this.salaryChartRef.nativeElement.getContext('2d');

    if (this.chart) this.chart.destroy(); // Destroy old chart before creating new one

    // Prepare Data
    const labels = this.filteredHistory.map(t => `${t.month.substring(0, 3)} '${t.year.toString().substring(2)}`);
    const netPayData = this.filteredHistory.map(t => t.netPayable);
    const deductionData = this.filteredHistory.map(t => t.totalDeductions);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Net Pay',
            data: netPayData,
            borderColor: '#198754', // Success Green
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Deductions',
            data: deductionData,
            borderColor: '#dc3545', // Danger Red
            borderDash: [5, 5],
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false }
      }
    });
  }

  // --- PDF Logic (Same as before) ---
  downloadSlip(txn: PayrollTransaction) {
    this.selectedSlip = txn;
    setTimeout(() => this.generatePDF(), 100);
  }

  generatePDF() {
    const data = document.getElementById('my-payslip-template');
    if (!data) return;
    html2canvas(data, { scale: 2 }).then(canvas => {
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`My_Payslip_${this.selectedSlip?.month}_${this.selectedSlip?.year}.pdf`);
    });
  }

  loadAcademicYears() {
    this.configService.getAllAcademicYears().subscribe(years => {
      // Logic: Take "2025-2026", split by "-", take "2025", convert to number
      const startYears = years.map(y => {
        const parts = y.name.split('-'); // Assuming name is "2025-2026"
        return parseInt(parts[0].trim(), 10);
      });

      // Remove duplicates and sort descending (newest first)
      this.availableYears = [...new Set(startYears)].sort((a, b) => b - a);
      console.log(this.availableYears);

    });
  }
}
