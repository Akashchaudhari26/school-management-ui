export interface AttendanceStats {
    totalStudents: number;
    totalStaff: number;
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    presencePercentage: number;
}