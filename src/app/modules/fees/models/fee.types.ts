// src/app/modules/fees/models/fee.types.ts

export type FeeStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
export type PaymentMode = 'CASH' | 'UPI' | 'CHEQUE' | 'ONLINE';

// Matches GuardianRef in Java
export interface GuardianRef {
    name: string;
    mobileNumber: string;
    relation: string;
}

// Matches FeeResponse
export interface FeeResponse {
    id: string;
    studentId: string;
    studentName: string;
    guardian: GuardianRef[]; // List of guardians
    academicYear: string;
    currentClassId: string;
    currentSection: string;

    feeItems: FeeItem[];
    payments: FeePayment[];

    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    status: FeeStatus;
}

export interface FeeItem {
    name: string;
    amount: number;
}

export interface FeePayment {
    receiptNo: string;
    amountPaid: number;
    mode: PaymentMode;
    collectedBy: string;
    paidAt: string; // ISO Date string
}

// Requests
export interface FeeCreateRequest {
    studentId: string;
    academicYear: string;
    feeItems: FeeItem[];
}

export interface FeePaymentRequest {
    amount: number;
    mode: PaymentMode;
    remarks?: string;
}
