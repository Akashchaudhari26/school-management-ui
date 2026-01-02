export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    EXCUSED = 'EXCUSED',
    HALF_DAY = 'HALF_DAY'
}

export enum UserType {
    STUDENT = 'STUDENT',
    STAFF = 'STAFF'
}

// Exact match for your Java AttendanceCreateRequest
export interface AttendanceCreateRequest {
    userId: string;
    userType: UserType;
    date: string; // Format: YYYY-MM-DD
    status: AttendanceStatus;
    remarks?: string;
}

// Exact match for your Java AttendanceResponse
export interface AttendanceResponse {
    id: string;
    userId: string;
    date: string;
    status: AttendanceStatus;
    remarks?: string;
    markedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    userType: UserType;
}

export interface AttendanceSummaryStats {
    totalUsers: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendancePercentage: number;
}