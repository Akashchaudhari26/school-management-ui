export class DateUtils {
    /**
     * Returns the current date in 'YYYY-MM-DD' format based on the user's
     * LOCAL system time, not UTC.
     */
    static getLocalISODate(): string {
        const now = new Date();
        // getTimezoneOffset() returns the difference in minutes. 
        // We convert it to milliseconds.
        // Note: The sign is inverted (UTC - Local), so we subtract it to add the offset.
        const offset = now.getTimezoneOffset() * 60000;

        // Create a new date shifted by that offset
        const localDate = new Date(now.getTime() - offset);

        // Return just the date part (YYYY-MM-DD)
        return localDate.toISOString().substring(0, 10);
    }

    /**
     * Optional: Helper if you ever need to format a specific date object
     */
    static toLocalISODate(date: Date): string {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().substring(0, 10);
    }

    static getCurrentAcademicYear(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Jan = 1

        if (month >= 4) {
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    }

    static generateAcademicYears(count: number): string[] {
        const years: string[] = [];
        const current = DateUtils.getCurrentAcademicYear();
        const startYear = parseInt(current.split('-')[0], 10);

        for (let i = 0; i < count; i++) {
            years.push(`${startYear - i}-${startYear - i + 1}`);
        }
        return years;
    }
}