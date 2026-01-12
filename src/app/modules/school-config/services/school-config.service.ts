import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AcademicYear, SchoolClass, Section, Subject } from '../models/school-config';

@Injectable({
    providedIn: 'root'
})
export class SchoolConfigService {

    private readonly apiUrl = `${environment.apiUrl}/config`;

    private classesCache$: Observable<SchoolClass[]> | null = null;
    private subjectsCache$: Observable<Subject[]> | null = null;
    private activeYearCache$: Observable<AcademicYear> | null = null;
    private academicYearsCache$?: Observable<AcademicYear[]>;


    constructor(private http: HttpClient) { }

    // ==========================================
    // 1. ACADEMIC YEAR MANAGEMENT
    // ==========================================

    createAcademicYear(year: AcademicYear): Observable<AcademicYear> {
        return this.http.post<AcademicYear>(`${this.apiUrl}/academic-year`, year).pipe(
            tap(() => {
                this.activeYearCache$ = null;
                this.academicYearsCache$ = undefined;
            }) // CLEAR CACHE on update
        );
    }

    getActiveAcademicYear(): Observable<AcademicYear> {
        if (!this.activeYearCache$) {
            this.activeYearCache$ = this.http.get<AcademicYear>(`${this.apiUrl}/academic-year/active`).pipe(
                shareReplay(1) // Cache the result
            );
        }
        return this.activeYearCache$;
    }


    getAllAcademicYears(): Observable<AcademicYear[]> {
        if (!this.academicYearsCache$) {
            this.academicYearsCache$ = this.http
                .get<AcademicYear[]>(`${this.apiUrl}/academic-year/all`)
                .pipe(
                    shareReplay(1)
                );
        }

        return this.academicYearsCache$;
    }


    // ==========================================
    // 2. CLASS MANAGEMENT
    // ==========================================

    createClass(schoolClass: SchoolClass): Observable<SchoolClass> {
        return this.http.post<SchoolClass>(`${this.apiUrl}/classes`, schoolClass).pipe(
            tap(() => this.classesCache$ = null) // Clear cache so list refreshes
        );
    }

    getAllClasses(): Observable<SchoolClass[]> {
        // If cache exists, return it. If not, fetch it.
        if (!this.classesCache$) {
            this.classesCache$ = this.http.get<SchoolClass[]>(`${this.apiUrl}/classes`).pipe(
                shareReplay(1) // <--- THIS IS THE MAGIC (Replays last result to new subscribers)
            );
        }
        return this.classesCache$;
    }

    updateClass(classId: string, schoolClass: SchoolClass): Observable<SchoolClass> {
        return this.http.put<SchoolClass>(`${this.apiUrl}/classes/${classId}`, schoolClass).pipe(
            tap(() => this.classesCache$ = null) // Clear cache on update
        );
    }

    // ==========================================
    // 3. SECTION MANAGEMENT
    // ==========================================

    addSection(classId: string, section: Section): Observable<SchoolClass> {
        // Backend: @PostMapping("/classes/{classId}/sections")
        return this.http.post<SchoolClass>(`${this.apiUrl}/classes/${classId}/sections`, section);
    }

    // ==========================================
    // 4. SUBJECT MANAGEMENT
    // ==========================================

    createSubject(subject: Subject): Observable<Subject> {
        return this.http.post<Subject>(`${this.apiUrl}/subjects`, subject).pipe(
            tap(() => this.subjectsCache$ = null) // Clear subject cache
        );
    }

    assignSubjectToClass(classId: string, subjectId: string): Observable<SchoolClass> {
        return this.http.post<SchoolClass>(
            `${this.apiUrl}/classes/${classId}/subjects/${subjectId}`,
            {}
        ).pipe(
            tap(() => this.classesCache$ = null) // IMP: This modifies CLASSES, so clear classes cache
        );
    }


    getAllSubjects(): Observable<Subject[]> {
        if (!this.subjectsCache$) {
            this.subjectsCache$ = this.http.get<Subject[]>(`${this.apiUrl}/subjects`).pipe(
                shareReplay(1)
            );
        }
        return this.subjectsCache$;
    }


}