// Matches Java: StudentMarkEntry
export interface StudentMarkEntry {
    studentId: string;
    studentName: string;
    admissionNumber?: string; // Optional: Useful for UI display if backend sends it
    marksObtained: number | null; // Nullable to handle empty input boxes
    remarks?: string;
}

// Matches Java: BulkMarksRequest
export interface BulkMarksRequest {
    classId: string;
    section: string;
    academicYear: string;
    examName: string;
    subjectName: string;
    totalMarks: number;
    studentMarks: StudentMarkEntry[];
}

// Matches Java: ExamFilter (For the search payload)
export interface ExamFilter {
    classId: string;
    section: string;
    academicYear: string;
    examName: string;
    subjectName: string;
    studentId?: string; // Optional: For specific student report cards
}

// ... existing interfaces (BulkMarksRequest, ExamFilter, etc.)

// --- REPORT CARD MODELS ---

export interface SubjectMark {
    subjectName: string;
    marksObtained: number;
    totalMarks: number;
    grade: string;
    remarks?: string;
}

export interface StudentReportCardResponse {
    // Header Info
    studentName: string;
    admissionNumber: string;
    className: string;
    section: string;
    academicYear: string;
    examName: string;

    // The Marks List
    subjects: SubjectMark[];

    // Summary Stats
    totalMarksObtained: number;
    maxTotalMarks: number;
    percentage: number;
    finalGrade: string;
    resultStatus: 'PASS' | 'FAIL'; // Union type for stricter control
}

// --- EXAM DEFINITION & SCHEDULE MODELS ---

// Matches Java: ExamSubjectSchedule
export interface ExamSubjectSchedule {
    subjectName: string;      // e.g., "Mathematics"
    examDate: Date;           // e.g., "2026-10-12" (ISO String from backend)
    startTime: string;        // e.g., "10:00 AM"
    duration: string;         // e.g., "2 Hours"
    syllabus: string;         // e.g., "Chapters 1, 2, and Algebra"

    // Optional: Only used if subject marks differ from the class default
    subjectMaxMarks?: number;
}

// Matches Java: ClassExamConfig
export interface ClassExamConfig {
    className: string;        // e.g., "Class 1"
    classId: string;          // Added: Good for querying
    // Added: The nested schedule list
    subjects: ExamSubjectSchedule[];
}

// Matches Java: ExamDefinition
export interface ExamDefinition {
    id?: string;              // Null when creating new
    name: string;             // e.g., "Unit Test 1"
    academicYear: string;     // e.g., "2025-2026"
    term?: string;            // Optional: "Term 1"

    isActive?: boolean;       // Defaults to true
    isPublished?: boolean;    // Added: Result visibility flag

    startDate?: Date;         // Added: Overall Start Date
    endDate?: Date;           // Added: Overall End Date

    // The list of rules for each class
    classConfigs: ClassExamConfig[];

    createdAt?: Date;
}