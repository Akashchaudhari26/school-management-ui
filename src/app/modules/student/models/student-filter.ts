export interface StudentSearchFilter {
    keyword?: string;      // Matches Java: private String keyword;
    classId?: string;
    section?: string;
    status?: string;
    admissionYear?: number;
    gender?: string;

    // Pagination & Sorting
    page: number;
    size: number;
    sortBy: string;
    direction: 'ASC' | 'DESC';
}