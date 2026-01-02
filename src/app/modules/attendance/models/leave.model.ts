export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LeaveType = 'SICK' | 'CASUAL' | 'EARNED' | 'UNPAID';

export interface LeaveRequest {
    id: string;
    userId: string;
    userName: string;
    userType: 'STAFF' | 'STUDENT';
    role: string; // e.g. "Teacher", "Accountant"

    startDate: string; // ISO Date
    endDate: string;   // ISO Date
    days: number;      // Calculated duration

    leaveType: LeaveType;
    reason: string;
    status: LeaveStatus;

    appliedOn: string; // ISO Timestamp
    rejectionReason?: string; // Optional, filled if rejected
}