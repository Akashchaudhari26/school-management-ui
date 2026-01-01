export interface AttendanceReportDTO {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    rollNumber?: string;

    // Stats
    totalWorkingDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    percentage: number;

    // Contact
    parentPhone?: string;
}