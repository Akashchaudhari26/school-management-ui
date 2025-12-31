export interface Student {
    id?: string; // Optional because new students don't have IDs yet
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string; // 'YYYY-MM-DD'
    gender: Gender;
    adharNumber?: string;
    phone?: string;
    email?: string;

    // School Details
    admissionYear: number;
    admissionNumber?: string;
    currentClassId: string;
    currentSection?: string;
    currentAcademicYear: string;

    // Relationships
    guardians: Guardian[];
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

export interface Guardian {
    name: string;
    relation: string; // 'FATHER', 'MOTHER', 'GUARDIAN'
    phone: string;
    email?: string;
    adharNumber?: string;
    primary: boolean;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // current page
}