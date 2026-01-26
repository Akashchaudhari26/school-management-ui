export interface SalaryStructure {
    id?: string;
    staffId: string;
    staffName: string; // Matched Java

    basicSalary: number;
    hra: number;
    da: number;
    transportAllowance: number;
    providentFund: number;
    professionalTax: number;
    grossSalary?: number; // Calculated by backend
    netSalary?: number;   // Calculated by backend
}

export interface PayrollTransaction {
    id: string;
    staffId: string;
    staffName: string; // Matched Java

    month: string;
    year: number;

    // Attendance Snapshot (Critical for the UI table)
    totalDaysInMonth: number;
    presentDays: number;
    paidLeaves: number;
    absentDays: number;
    payableDays: number;

    // Financial Snapshot
    basicEarned: number;
    hraEarned: number;
    totalEarnings: number;
    totalDeductions: number;
    netPayable: number;

    status: 'DRAFT' | 'GENERATED' | 'PAID';
    generatedDate?: string; // Java LocalDate usually serializes to String "YYYY-MM-DD"
}