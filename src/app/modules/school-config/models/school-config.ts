export interface Section {
    name: string;      // "A", "B", "Rose"
    capacity: number;  // e.g., 30
}

export interface Subject {
    id?: string;       // Optional for new subjects (backend generates it)
    name: string;      // "Mathematics"
    code: string;      // "MATH-01"
    classId?: string;  // Reference to SchoolClass ID (Optional if master subject)
    isOptional: boolean;
}

export interface SchoolClass {
    id: string;        // "NURSERY", "LKG" (Manually entered by Admin)
    displayName: string; // "Nursery", "LKG", "Grade 1"
    program: string;   // "Pre-Primary", "Primary"
    order: number;     // For sorting: 1, 2, 3
    sections: Section[];
    subjectNames: string[]; // List of Subject IDs
}

export interface AcademicYear {
    id?: string;       // Optional, usually generated from name (e.g. "2025-2026")
    name: string;      // "2025-2026"
    startDate: string; // ISO Date String "YYYY-MM-DD"
    endDate: string;   // ISO Date String "YYYY-MM-DD"
    active: boolean;   // boolean in Java maps directly to boolean in TS
}