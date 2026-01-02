export interface Staff {
  id: string; // Maps to Java 'id'

  fullName: string;
  email?: string;
  mobile: string;
  gender: string;
  dateOfBirth: string; // Java LocalDate becomes "YYYY-MM-DD" string
  aadhaar?: string;    // Matches your DTO

  staffType: 'TEACHER' | 'NON_TEACHING' | 'ADMIN';
  designation: string;
  joiningDate: string;
  employeeCode: string;

  // Arrays
  subjects?: string[];
  assignedClassIds?: string[];

  tenantId?: string;
}

export interface StaffSearchFilter {
  keyword?: string;
  staffType?: string;
  designation?: string;
  status?: string;
  page: number;
  size: number;
  sortBy: string;
  direction: 'ASC' | 'DESC';
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}